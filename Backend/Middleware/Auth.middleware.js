const User = require('../Models/User.models.js');
const asyncHandler = require('../Utils/AsyncHandler.js');
const ApiError = require('../Utils/ApiError.js');
const jwt = require('jsonwebtoken');
const signupSchema = require('../Config/Joi.js');

const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized Access!");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token - User not found!");
        }
        if (user.accountType === 'local' && !user.isVerified) {
            throw new ApiError(403, "Access Denied! Account email verification status is unverified.");
        }

        req.user = user;
        next();
    }
    catch (e) {
        console.error("[Auth Middleware Validation Failure]: ", e.message);
        next(new ApiError(401, e?.message || "Invalid Access Token!"));
    }
});

const validateSignup = asyncHandler(async (req, res, next) => {
    const { error } = signupSchema.validate(req.body);
    if (error) {
        let msg = error.details.map((el) => el.message).join(", ");
        throw new ApiError(400, msg);
    }
    next();
})

module.exports = { authMiddleware, validateSignup };