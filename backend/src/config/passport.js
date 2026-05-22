const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { prisma } = require('./database');

const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('Google account has no email'));

          const user = await prisma.user.upsert({
            where: { email },
            update: {
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isEmailVerified: true
            },
            create: {
              email,
              name: profile.displayName || email.split('@')[0],
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isEmailVerified: true
            }
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  return passport;
};

module.exports = configurePassport;
