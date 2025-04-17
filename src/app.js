const express = require('express');
const connectDB = require('./config/database.js');
const app = express();
const User = require('./models/user.js');
const { validateSignUpData } = require('./utils/validation.js');
const bcrypt = require('bcrypt');
app.use(express.json());

// Force creation of indexes based on schema
// User.syncIndexes()
//     .then(() => console.log('Indexes synced'))
//     .catch(err => console.error('Index sync error:', err));


app.post('/signup', async (req, res) => {
    try {
        //validation of data
        validateSignUpData(req);
        //schema level validation
        const { password, ...rest } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            ...rest,
            password: passwordHash
        });

        await user.save();
        res.status(200).send({
            "success": true, "message": "Data saved successfuly", data: {
                user
            }
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ "success": false, "message": err.message });
    }
});


//Login 
app.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Email ID is not present in DB");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            res.status(200).send({ status: true, message: "Login Successful!" });
        } else {
            res.status(400).send({ status: false, message: "Login Failed!" });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ "success": false, "message": err.message });
    }
});


//Update A User
app.patch('/user/:id', async (req, res) => {
    const userId = req.params.id;
    const updateObj = req.body;
    console.log(updateObj.emailId);
    try {
        const UPDATES_ALLOWED = ["age", "photoUrl", "about", "skills", "gender"];
        const isUpdateAllowed = Object.keys(updateObj).every(r => UPDATES_ALLOWED.includes(r));
        if (!isUpdateAllowed) {
            throw new Error("Update not allowed!")
        }
        const result = await User.findByIdAndUpdate({ _id: userId }, { $set: updateObj }, {
            new: true,
            runValidators: true
        })
        if (result.matchedCount === 0) {
            return res.status(404).json({ "message": "User not found!" });
        }
        res.status(200).json({ success: true, message: "User updated successfuly", data: result });
    } catch (err) {
        res.status(500).json({ message: "Server Error" + err })
    }
})

//delete a user
app.delete("/user/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        console.log(userId);
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json({ message: "User deleted Successfuly", user: deletedUser });
    }
    catch (err) {
        console.log("error deleted user" + err);
        res.status(500).json({ message: "Server Error" });
    }
})



//Get single user
app.get("/user/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        let users = await User.findOne({ _id: userId }, { firstName: 1 });
        res.status(200).send({ success: true, data: users });
    } catch (err) {
        res.status(400).send({ success: failed, message: "Data fetched failed" });
    }
});


//Get All Users
app.get("/user", async (req, res) => {
    try {
        const user = await User.find({});
        if (user.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No users found in the database"
            })
        }
        res.status(200).json({
            success: true,
            data: user
        })
    } catch (err) {
        res.status(500).json({ message: 'Server Error!' });
    }

})
connectDB()
    .then(() => {
        console.log("database connection established...");
        app.listen(7777, () => {
            console.log("Server is successfuly running on port 7777");
        })
    }).catch((err) => {
        console.log("Database cannot be connected");
    })

