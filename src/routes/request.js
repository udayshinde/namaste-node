
const express = require('express');
const mongoose = require('mongoose');

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const requestRouter = express.Router();

requestRouter.post('/send/:status/:toUserId', userAuth, async (req, res, next) => {
    try {
        const toUserId = req.params.toUserId;
        const fromUserId = req.user._id;
        const status = req.params.status;

        if (fromUserId === toUserId) {
            throw new Error('User can not send connection request to himself');
        }
        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status type: " + status });
        }

        //If UserID format is incorrect 
        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
        }

        //Check if user exists
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            res.status(404).json({ success: false, message: 'User not exist!' });
        }

        //If there is an existing connection request
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            res.status(400).json({ success: false, message: "Connection request already exist!" })
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const data = await connectionRequest.save();
        res.status(200).send({
            success: true,
            message: 'connection request sent successfuly!',
            data: data
        })
    } catch (err) {
        res.status(400).json({ success: false, message: `ERROR: ${err.message}` });
    }
});

requestRouter.post('/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status type: " + status });
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });
        if (!connectionRequest) {
            return res.status(404).json({ success: false, message: "Connection request not found!" });
        }
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.status(200).json({ success: true, message: `Connection request ${status} successfully!`, data: data });
    } catch (err) {
        res.status(400).json({ success: false, message: `ERROR: ${err.message}` });
    }
})

module.exports = requestRouter;