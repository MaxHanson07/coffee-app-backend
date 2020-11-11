const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    cafe_name: {
        type: String
    },
    cafe_address: {
        type: String
    },
    notes: {
        type: String
    }
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
