const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173/",
  "https://goalkeeper-umber.vercel.app/",
  process.env.CORS_ORIGIN_1,
  process.env.CORS_ORIGIN_2,
  process.env.CORS_ORIGIN_3,
  process.env.CORS_ORIGIN_4,
].filter(Boolean);

// CORS config
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});
app.use('/v1/api/users', require('./routes/user.routes'));
app.use('/v1/api/customers', require('./routes/customer.routes'));
app.use('/v1/api/items', require('./routes/item.routes'));
app.use('/v1/api/goalkeepers', require('./routes/goalkeeper.routes'));
app.use('/v1/api/teamplay-stats', require('./routes/teamplayStats.routes'));
app.use('/v1/api/kpl-records', require('./routes/kplRecord.routes'));
app.use('/v1/api/goalkeeping-stats', require('./routes/goalkeepingStats.routes'));
app.use('/v1/api/experiences', require('./routes/experience.routes'));
app.use('/v1/api/style-of-play', require('./routes/styleOfPlay.routes'));
app.use('/v1/api/honors-and-awards', require('./routes/honorsAndAwards.routes'));
app.use('/v1/api/defensive-stats', require('./routes/defensiveStats.routes'));
app.use('/v1/api/former-clubs', require('./routes/formerClubs.routes'));
app.use('/v1/api/discipline-records', require('./routes/disciplineRecord.routes'));
app.use('/v1/api/new-requests', require('./routes/newRequest.routes'));
app.use('/v1/api/leagues', require('./routes/league.routes'));
app.use('/v1/api/partners', require('./routes/partner.routes'));
app.use('/v1/api/orders', require('./routes/order.routes'));
app.use('/v1/api/payments', require('./routes/payment.routes'));
app.use('/v1/api/carts/customer', require('./routes/cart.routes'));

// Catch-all route for non-existent endpoints
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The route '${req.originalUrl}' does not exist.`,
  });
});

// General error-handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
