// config/connector.js
const mongoose = require('mongoose');

function connector() {
  mongoose.set('strictQuery', false);

  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Event Planner'
  })
  .then(() => console.log('✅ DB connection successful --> Event Planner'))
  .catch((err) => console.error('❌ DB connection error:', err.message));
}

module.exports = connector;
