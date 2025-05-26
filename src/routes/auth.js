const express = require('express');
const { validateSignUpData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const authRouter = express.Router();

//Signup
authRouter.post('/signup', async (req, res) => {
    try {
        //validation of data
        validateSignUpData(req);
        //schema level validation
        const { firstName, lastName, emailId, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        });

        const savedUser = await user.save();

        //CREATE JWT TOKEN
        const token = await savedUser.getJWT();

        //CREATE COOKIE WITH THE TOKEN
        res.cookie("token", token, {
            expires: new Date(Date.now() + 60 * 60 * 1000)
        });
        res.status(200).send({
            "success": true, "message": "Data saved successfuly", data: {
                user
            }
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ "success": false, "message": "ERROR : " + err.message });
    }
});

//Login 
authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            res.status(401).json({ "success": false, "message": "Please Login!" });
        }
        const isPasswordValid = await user.validatePassword(password)

        if (isPasswordValid) {

            //CREATE JWT TOKEN
            const token = await user.getJWT();

            //CREATE COOKIE WITH THE TOKEN
            res.cookie("token", token, {
                expires: new Date(Date.now() + 60 * 60 * 1000)
            });
            res.status(200).send({ status: true, message: "Login Successful!", user: user });
        } else {
            res.status(400).send({ status: false, message: "ERROR! Invalid Credentials!" });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ "success": false, "message": err.message });
    }
});

authRouter.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ "success": true, "message": "Logout Successful!" })
});

module.exports = authRouter;