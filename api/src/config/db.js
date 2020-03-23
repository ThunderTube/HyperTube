const mongoose = require('mongoose');

const connectDB = () =>
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });

module.exports = connectDB;
