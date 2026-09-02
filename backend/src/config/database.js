const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://mongodb:27017/wtp_db';
    await mongoose.connect(uri);
    console.log(`[MONGO] Database Connected to ${uri}`);
  } catch (error) {
    console.error('[MONGO] Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
