const express = require('express');
const app = express();
const connectDB = require('./config/database.js');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');


const allowOrigins = [
    'http://localhost:4200',
    'http://13.233.145.221:3000/',
    'https://dev-tinder.info',
    'https://www.dev-tinder.info',
    'https://api.dev-tinder.info'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
        app.listen(process.env.PORT || 7777, () => {
            console.log(`Server is successfuly running on port ${process.env.PORT || 7777}`);
        })
    }).catch((err) => {
        console.log("Database cannot be connected");
    })

