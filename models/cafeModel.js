const mongoose = require("mongoose");

const CafeSchema = new mongoose.Schema({
    place_id: {
        type: String
    },
    name: {
        type: String
    },
    lat: {
        type: Number
    },
    lng: {
        type: Number
    },
    formatted_address: {
        type: String
    },
    website: {
        type: String
    },
    weekday_text: [
        {
            type: String
        }
    ],
    photos: [
        {}
    ],
    custom_data: {
        roasters: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Roaster"
            }
        ],
        instagram_url: {
            type: String
        },
        photos: [
            {}
        ],
        likes: {
            type: Number
        }
    },
    is_featured: {
        type: Boolean,
        default: false
    }
});


const Cafe = mongoose.model("Cafe", CafeSchema);

module.exports = Cafe;
