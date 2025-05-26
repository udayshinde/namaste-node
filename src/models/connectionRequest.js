const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: "{VALUE} is incorrect status type"
        }
    }
}, {
    timestamps: true
});
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    //check if fromUserID is same as toUserID
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("User can not send connection request to yourself");
    }
    next();
})

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema)
module.exports = ConnectionRequest;