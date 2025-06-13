
const express = require('express');
const mongoose = require('mongoose');

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const { sendEmail } = require('../utils/sendEmail');
const requestRouter = express.Router();

requestRouter.post('/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const toUserId = req.params.toUserId;
        const fromUserId = req.user._id;
        const status = req.params.status;

        if (fromUserId === toUserId) {
            return res.status(400).json({ success: false, message: 'User cannot send request to himself' });
        }

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status type: " + status });
        }

        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ success: false, message: 'User not exist!' });
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({ success: false, message: "Connection request already exist!" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();

        try {
            await sendEmail({
                to: "udaysinh2good@gmail.com",
                subject: "New Connection Request",
                text: `You have a new connection request from ${req.user.firstName} ${req.user.lastName}. Please check your requests.`
            });
        } catch (emailErr) {
            console.error("Email failed to send:", emailErr.message);
            // Optional: return res.status(500).json({ success: false, message: 'Email failed to send' });
        }

        return res.status(200).send({
            success: true,
            message: 'Connection request sent successfully!',
            data
        });

    } catch (err) {
        return res.status(400).json({ success: false, message: `ERROR: ${err.message}` });
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