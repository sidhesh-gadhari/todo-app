const User = require('../Models/User.models.js');
const Task = require('../Models/Tasks.models.js');
const asyncHandler = require('../Utils/AsyncHandler.js');
const ApiError = require('../Utils/ApiError.js');
const ApiResponse = require('../Utils/ApiResponse.js');
const SendEmail = require('../Utils/SendEmail.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const { getCalendarClient } = require('../Controller/Tasks.controller.js'); 

const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 10 * 24 * 60 * 60 * 1000
};

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
}

const Signup = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ApiError(400, "All Fields Are Required!");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new ApiError(409, "User Already Exists and is verified!");
            }
            else {
                const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
                if (existingUser.lastVerificationEmailSentAt && existingUser.lastVerificationEmailSentAt > tenMinutesAgo) {
                    const timeRemaining = Math.ceil((existingUser.lastVerificationEmailSentAt.getTime() + (10 * 60 * 1000) - Date.now()) / 1000 / 60);
                    throw new ApiError(429, `Please wait ${timeRemaining} minutes before requesting another verification email.`);
                }

                const verificationToken = crypto.randomBytes(32).toString("hex");
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                existingUser.password = hashedPassword;
                existingUser.verifiedToken = verificationToken;
                existingUser.verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Mins expiry
                existingUser.lastVerificationEmailSentAt = new Date(); // Update the cooldown timer

                await existingUser.save({ validateBeforeSave: false });

                const verificationUrl = `${process.env.CLIENT_REDIRECT_URL || 'http://localhost:5173'}/verify-account?token=${verificationToken}`;
                const emailHtml = `
                <h2>Welcome to ToDo App!</h2>
                <p>Please verify your email address to complete your signup.</p>
                <p>Click the link below to verify:</p>
                <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>This link will expire in 15 minutes.</p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
                `;

                try {
                    await SendEmail({
                        email: existingUser.email,
                        subject: "Verify Your Account - ToDo App",
                        html: emailHtml
                    });
                } catch (emailError) {
                    console.error("Failed to send verification email", emailError);
                }

                const userWithoutPassword = await User.findById(existingUser._id).select("-password -verifiedToken");

                return res
                    .status(200)
                    .json(
                        new ApiResponse(200, userWithoutPassword, "Verification email resent successfully! Please check your inbox.")
                    );
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = await User.create({
            email: email.trim(),
            password: hashedPassword.trim(),
            accountType: 'local',
            isVerified: false,
            verifiedToken: verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // Added expiration parameter
            lastVerificationEmailSentAt: new Date()
        });

        if (!newUser) {
            throw new ApiError(500, "Signup Failed!");
        }

        const verificationUrl = `http://localhost:5173/verify-account?token=${verificationToken}`;
        const emailHtml = `
        <h2>Welcome to ToDo App!</h2>
        <p>Please verify your email address to complete your signup.</p>
        <p>Click the link below to verify:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
     `;

        try {
            await SendEmail({
                email: newUser.email,
                subject: "Verify Your Account - ToDo App",
                html: emailHtml
            })
        }
        catch (emailError) {
            console.error("Failed to send verification email", emailError);
        }

        const userWithoutPassword = await User.findById(newUser._id).select("-password");

        return res
            .status(201)
            .json(
                new ApiResponse(201, userWithoutPassword, "User Signup Successful!")
            )
    }
    catch (e) {
        console.error("Signup Failed: ", e);
        next(e);
    }
});

const Login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Both Fields Are Required!");
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new ApiError(404, "User Not Found!");
    }

    if (existingUser.accountType === 'local' && !existingUser.isVerified) {
        throw new ApiError(403, "Please verify your email address before logging in!");
    }

    if (existingUser.accountType === 'google' && !existingUser.password) {
        throw new ApiError(401, "Account Is Registered Via Google Sign-In. Please use the Google option!");
    }

    const isMatch = await existingUser.isPasswordCorrect(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid Password!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existingUser._id);

    const loggedInUser = await User.findById(existingUser._id).select("-password");
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken: accessToken, refreshToken: refreshToken },
                "User Logged In Successfully!"
            )
        )
});

const Logout = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            returnDocument: 'after'
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "User Logged Out Successfully!")
        )
});

const refreshUserToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password");

        if (!user || user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token!");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { user: user, accessToken: accessToken, refreshToken: newRefreshToken },
                    "Token Is Refreshed!"
                )
            )
    }
    catch (e) {
        console.error(e);
        next(e);
    }
});

const getSessionUser = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, null, "Guest Session!")
            )
    }

    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password");

        return res
            .status(200)
            .json(
                new ApiResponse(200, user || null, user ? "Session Active" : "Guest Session")
            )
    }
    catch (e) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, null, "Guest Session")
            )
    }
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current User Fetched Successfully!"
            )
        )
});

const GoogleAuthCallbackController = asyncHandler(async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.redirect(`${process.env.CLIENT_REDIRECT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    try {
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        res.cookie("accessToken", accessToken, cookieOptions)
        res.cookie("refreshToken", refreshToken, cookieOptions)

        return res.redirect(`${process.env.CLIENT_REDIRECT_URL || 'http://localhost:5173'}/dashboard`);
    }
    catch (e) {
        console.error("[OAuth Callback Controller Failure]:", e);
        return res.redirect(`${process.env.CLIENT_REDIRECT_URL || 'http://localhost:5173'}/login?error=internal_server_error`);
    }
})

const verifyAccount = asyncHandler(async (req, res, next) => {
    const { token } = req.query;
    if (!token) {
        throw new ApiError(400, "Verification Token Is Missing!");
    }

    const user = await User.findOne({ verifiedToken: token });
    
    if (!user) {
        throw new ApiError(400, "Invalid verification token! You may have requested a new one.");
    }

    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
        throw new ApiError(400, "Verification token has expired! Please sign up again to get a new link.");
    }

    user.isVerified = true;
    user.verifiedToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Account verified successfully! You can now log in.")
        )
})

const deleteUser = asyncHandler(async (req, res, next) => {
    if(!req.user._id) 
    {
     throw new ApiError(401, "Unauthorized Access!");   
    }
    const { id } = req.params;
    if(req.user._id.toString() !== id) 
    {
     throw new ApiError(403, "Forbidden! You can only purge your own profile.");
    }
    
    const fullUser = await User.findById(id);
    if(!fullUser) 
    {
     throw new ApiError(404, "User Profile Matrix Not Found!");
    }
    const userTasks = await Task.find({ user: id });

    if(fullUser.googleCredentials?.access_token) 
    {
     try 
     {
      const calendar = getCalendarClient(fullUser);
            
      // Sequential block execution loop to empty primary tracking targets cleanly
      for(const task of userTasks) 
      {
       if(task.googleEventId) 
       {
        try 
        {
         await calendar.events.delete({ calendarId: 'primary', eventId: task.googleEventId });
        }  
        catch(singleEventErr) 
        {
         console.error(`⚠️ Failed to remove event ${task.googleEventId}:`, singleEventErr.message);
        }
       }
      }
     } 
     catch(calendarError) 
     {
      console.error("⚠️ [Calendar Core Deletion Link Broken]: ", calendarError.message);
     }
    }

    await Task.deleteMany({ user: id });
    await User.findByIdAndDelete(id);

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "Your Profile and Linked Timelines Cleared Cleanly Everywhere! 🗑️")
        );
})

module.exports = { Signup, Login, Logout, refreshUserToken, getSessionUser, getCurrentUser, GoogleAuthCallbackController, verifyAccount, deleteUser };