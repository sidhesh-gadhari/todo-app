const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string()
           .email()
           .required()
           .messages({"string.email": "Please enter a valid email address"}),
    password: Joi.string()
              .min(6)
              .max(15)
              .required()
              .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])/)
              .messages({
                "string.empty": "Please enter a password",
                "string.min": "Password must be at least 6 characters",
                "string.max": "Password must be at most less than 16 characters",
                "string.pattern.base": "Password doesn't follow the required pattern",
                "any.required": "Password is required",
              })
});

module.exports = signupSchema;