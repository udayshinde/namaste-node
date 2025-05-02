const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function validateSkills(val) {
    return val.length <= 20;
}

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: props => `Invalid email ${props.value}, Please enter valid email!`
        }
    },
    password: {
        type: String,
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value);
            },
            message: 'Please Enter Strong Password!'
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate: {
            validator: function (value) {
                return ["male", "female", "other"].includes(value)
            },
            message: props => `Invalid Gender! ${props.value} is not valid gender!`
        }
    },
    photoUrl: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/previews/045/711/185/non_2x/male-profile-picture-placeholder-for-social-media-forum-dating-site-chat-operator-design-social-profile-template-default-avatar-icon-flat-style-free-vector.jpg",
        validate: {
            validator: function (value) {
                return validator.isURL(value);
            },
            message: "Invalid Photo URL!"
        }
    },
    about: {
        type: String,
        default: 'This is default value of the User!'
    },
    skills: {
        type: [String],
        validate: [validateSkills, "You can enter maximum 20 skills"]
    }
}, {
    timestamps: true
});
userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$2500", {
        expiresIn: '1h'
    });
    return token;
}

userSchema.methods.validatePassword = async function (passwordEnteredByUser) {
    const user = this;
    const isValidate = await bcrypt.compare(passwordEnteredByUser, user.password);
    return isValidate;
}
const User = mongoose.model('User', userSchema);
module.exports = User;