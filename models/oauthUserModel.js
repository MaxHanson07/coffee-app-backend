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
    }
});


module.exports = mongoose.model('OAuthUser', OauthUserSchema);