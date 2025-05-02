const express = require('express');
const profileRouter = express.Router();

const User = require("../models/user");
const { userAuth } = require('../middlewares/auth');
const { validateProfileEditData } = require('../utils/validation');

//view profile
profileRouter.get('/view', userAuth, async (req, res) => {
    try {
        if (!validateProfileEditData(req)) {
            throw new Error("Invalid Edit Request!");
        }
        const loggedInUser = req.user;
        res.status(200).json({
            message: `${loggedInUser.firstName}, this is your info`,
            data: loggedInUser
        });

    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

profileRouter.patch('/edit', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!validateProfileEditData(req)) {
            throw new Error("Invalid Edit Request!");
        }
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
        await loggedInUser.save();
        res.status(200).json({
            message: `${loggedInUser.firstName}, your profile updated successfuly!`,
            data: loggedInUser
        });
    } catch (err) {
        res.status(400).json({
            message: `ERROR :${err.message}`
        })
    }
});

module.exports = profileRouter;
