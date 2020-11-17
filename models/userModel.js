const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.ObjectId
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    userType: {
        type: String
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
