const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateStudentId } = require('../utils/studentIdGenerator');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// The strategy is only registered when the OAuth client credentials are
// present, so the server can start before the environment is configured.
// The /api/auth/google routes handle the unconfigured case explicitly.
const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (hasGoogleCredentials) {
  // Google OAuth for student sign-in only.
  // The callback URL must exactly match the "Authorized redirect URIs"
  // registered for the OAuth client in the Google Cloud Console.
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${CLIENT_URL}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = (
            (profile.emails && profile.emails[0] && profile.emails[0].value) || ''
          ).toLowerCase().trim();

          if (!email) {
            return done(null, false, { message: 'Google account has no email address' });
          }

          const googleName =
            profile.displayName ||
            (profile.name && profile.name.givenName) ||
            email.split('@')[0] ||
            'Student';

          const existingUser = await User.findOne({ email });

          if (existingUser) {
            // Google sign-in is restricted to student accounts only.
            if ((existingUser.role || '').toLowerCase() !== 'student') {
              return done(null, false, {
                message: 'Only student accounts are allowed to sign in with Google'
              });
            }
            return done(null, existingUser);
          }

          // Create a new student account. Passwords do not apply to
          // Google-signed users, so a random one is stored for schema safety.
          const randomPassword = crypto.randomBytes(24).toString('hex');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(randomPassword, salt);
          const studentId = await generateStudentId();

          const newUser = await User.create({
            studentId,
            fullName: googleName,
            name: googleName,
            email,
            password: hashedPassword,
            mobileNumber: '',
            role: 'student',
            emailVerified: true,
            isActive: true
          });

          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;