const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongooseAggregate = require('mongoose-aggregate-paginate-v2');
const { boolean } = require('joi');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            index: true
        },
        password: {
            type: String,
            required: function () {
                return this.accountType === 'local';
            }
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        accountType: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
            required: true
        },
        googleCredentials: {
            access_token: { type: String },
            refresh_token: { type: String }
        },
        refreshToken: {
            type: String
        },
        isVerified: {
            type: Boolean,
            default: function () {
                return this.accountType === 'google';
            }
        },
        verifiedToken: {
            type: String,
            default: null
        },
        verificationTokenExpiresAt: {
            type: Date,
        },
        lastVerificationEmailSentAt: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
);

userSchema.methods.isPasswordCorrect = async function isPasswordCorrect(password) {
    try {
        return await bcrypt.compare(password, this.password);
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.plugin(mongooseAggregate);

module.exports = mongoose.model("User", userSchema);