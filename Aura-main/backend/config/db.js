const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expensetracker';
  try {
    await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected successfully to ${uri}`);
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
