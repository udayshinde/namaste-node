const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');
const express = require("express");
const User = require("../models/user");
const { Connection } = require("mongoose");
const userRouter = express.Router();

const userDataArr = ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender'];
//Get all the pending connection requests of the logged in user

userRouter.get('/requests/recieved', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: userId,
            status: 'interested'
        }).populate('fromUserId', userDataArr);

        if (!connectionRequests || connectionRequests.length === 0) {
            return res.status(200).json({ success: false, message: 'No connection requests found', data: [] });
        }

        res.status(200).json({
            success: true,
            message: 'Connection requests retrieved successfully',
            data: connectionRequests
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `ERROR: ${err.message}` });
    }
});

userRouter.get('/connections', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: userId, status: 'accepted' },
                { toUserId: userId, status: 'accepted' }
            ]
        }).populate('fromUserId', userDataArr)
            .populate('toUserId', userDataArr);

        if (!connectionRequests || connectionRequests.length === 0) {
            return res.status(200).json({ success: false, message: 'No connections found', data: [] });
        }
        const finalConnections = connectionRequests.map((connection) => {
            const isSender = connection.fromUserId._id.toString() === userId.toString();
            const otherUser = isSender ? connection.toUserId : connection.fromUserId;

            return {
                ...otherUser.toObject(),
                status: connection.status
            };
        });
        res.status(200).json({
            success: true,
            message: 'Connections retrieved successfully',
            data: finalConnections
        })
    } catch (err) {
        res.status(500).json({ success: false, message: `ERROR: ${err.message}` });
    }
});

//feed
userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        // user should see all the users except logged in user 
        // and the users who are already connected with him/her, means users connections
        // and the users who have already sent connection requests to him/her
        // accpted and ignored connection requests

        const userId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;
        limit = limit > 10 ? 10 : limit; // Limit the number of users to 10 per page
        //Find the connection requests which sent and recived by the logged in user
        let connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: userId },
                { toUserId: userId }
            ]
        }).select('fromUserId toUserId');

        const hideConnectionRequests = new Set();
        connectionRequests.forEach((request) => {
            hideConnectionRequests.add(request.fromUserId.toString());
            hideConnectionRequests.add(request.toUserId.toString());
        });
        const users = await User.find({
            $and: [
                { _id: { $ne: userId } }, // Exclude the logged-in user
                { _id: { $nin: Array.from(hideConnectionRequests) } } // Exclude users in connection requests
            ]
        }).select(userDataArr)
            .skip(skip).limit(limit);

        res.status(200).json({ success: true, "Total Records": users.length, message: "Connection requests found successfully", data: users })
    } catch (err) {
        res.status(500).json({ success: false, message: `ERROR: ${err.message}` });

    }
});

module.exports = userRouter;