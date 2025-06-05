const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Customer = require('../models/customer.model');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/v1/api/customers/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingCustomer = await Customer.findOne({ where: { email: profile.emails[0].value } });

    if (existingCustomer) {
      return done(null, existingCustomer);
    }

    const newCustomer = await Customer.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      phoneNumber: `google-${profile.id}`, // Placeholder
      password: `google-oauth-${profile.id}`, // This gets hashed but won't be used
    });

    return done(null, newCustomer);
  } catch (err) {
    return done(err, null);
  }
}));

// Optionally handle session support if needed
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await Customer.findByPk(id);
  done(null, user);
});

module.exports = passport;
