const express = require('express');
const connectDB = require('./config/database.js');
const app = express();
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('Requested path:', req.path);
    next();
});

const authRouter = require('./routes/auth.js');
const requestRouter = require('./routes/request.js');
const profileRouter = require('./routes/profile.js');


app.use('/', authRouter);
app.use('/request', requestRouter);
app.use('/profile', profileRouter);
// Force creation of indexes based on schema
// User.syncIndexes()
//     .then(() => console.log('Indexes synced'))
//     .catch(err => console.error('Index sync error:', err));



connectDB()
    .then(() => {
        console.log("database connection established...");
        app.listen(7777, () => {
            console.log("Server is successfuly running on port 7777");
        })
    }).catch((err) => {
        console.log("Database cannot be connected");
    })

