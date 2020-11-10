const mongoose = require("mongoose");

const RoasterSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    instagram_url: {
        type: String
    },
    photos: [
        {}
    ],
    website: {
        type: String
    },
    cafes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cafe"
        }
    ]
});


const Roaster = mongoose.model("Roaster", RoasterSchema);

module.exports = Roaster;
