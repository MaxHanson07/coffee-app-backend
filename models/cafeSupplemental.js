const mongoose = require("mongoose");

const CafeCustomSchema = new mongoose.Schema({
    cafe_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cafe"
    },
    roasters: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Roaster"
        }
    ],
    instagram_link: {
        type: String
    },
    photos: [
        {}
    ]
});


const CafeCustom = mongoose.model("Cafe", CafeCustomSchema);

module.exports = CafeCustom;
