const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/User.models.js');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, 
    async (accessToken, refreshToken, profile, done) =>
    {
     try 
     {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;
      
      let user = await User.findOne({$or: [{googleId}, {email}]});
      if(!user)
      {
       user = await User.create(
                {
                 name,
                 email,
                 googleId, 
                 accountType: 'google',
                 googleCredentials: {
                    access_token: accessToken,
                    refresh_token: refreshToken 
                 }
                }
              ); 
      }
      else if(user.accountType === 'local' && !user.googleId)
      {
       user.googleId = googleId;
       user.accountType = 'google';

       user.googleCredentials.access_token = accessToken;
       if (refreshToken) 
       {
        user.googleCredentials.refresh_token = refreshToken;
       }
       await user.save({ validateBeforeSave: false }); 
      }

      return done(null, user);
     } 
     catch(e) 
     {
      console.error("[Passport Configuration Internal Error]:", e);
      return done(e, null);  
     }   
    }
));

module.exports = passport;