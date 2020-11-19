const mongoose = require('mongoose');


const OauthUserSchema = new mongoose.Schema({
    user_id: { 
        type: String, 
        required: true, 
        index: { unique: true } 
    },
    name: {
        type: String
    },
    photo_url: {
        type: String
    },
    email: {
        type: String
    },
    liked_cafes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cafe"
        }
    ],
    check_ins: [
        {
            cafe_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Cafe"
            },
            timestamp: {
                type: Date
            }
        }
    ]
});


module.exports = mongoose.model('OAuthUser', OauthUserSchema);