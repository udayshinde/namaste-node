const mongoose = require('mongoose');
require('dotenv').config();

const URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/devTinder';

const connectDB = async () => {
    await mongoose.connect(URL);
}

module.exports = connectDB;



