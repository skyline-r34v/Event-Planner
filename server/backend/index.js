const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Connect DB
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/venues', require('./routes/venueRouter'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/auditlogs', require('./routes/auditRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// Error handler (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
