const express = require('express');
const app = express();
const port = 3000;
const userRoutes = require('./routes/user.routes');
const customerRoutes = require('./routes/customer.routes');

// Middleware to parse JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});
app.use('/v1/api/users', userRoutes);
app.use('/v1/api/customers', customerRoutes);

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
