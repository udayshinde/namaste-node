const express = require('express');
const app = express();
const connectDB = require('./config/database.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const allowOrigins = [
    'https://dev-tinder.info',
    'https://www.dev-tinder.info',
    'https://api.dev-tinder.info'
];

app.use(cors({
    origin: allowOrigins,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use((req, res, next) => {
    console.log('Requested path:', req.path);
    next();
});

const authRouter = require('./routes/auth.js');
const requestRouter = require('./routes/request.js');
const profileRouter = require('./routes/profile.js');
const userRouter = require('./routes/user.js');


app.use('/api/', authRouter);
app.use('/api/request', requestRouter);
app.use('/api/profile', profileRouter);
app.use('/api/user', userRouter);


app.all('*', (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Cannot find ${req.originalUrl} on this server`
    })
});
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

