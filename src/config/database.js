const mongoose = require('mongoose');
const URL = "mongodb+srv://uday2good:Qw3wmyT5WxOb7Lt9@namastenode.tg7ra.mongodb.net/devTinder";

const connectDB = async () => {
    await mongoose.connect(URL);
}

module.exports = connectDB;



