const express = require("express");
const router = express.Router();
const User = require('../models/userModel')
const OAuthUser = require("../models/oauthUserModel");
// const Cafe = require("../models/cafeModel");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const Cafe = require("../models/cafeModel");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
        user_id: payload.sub,
        name: payload.name,
        photo_url: payload.picture,
        email: payload.email
    }
}

const checkAuthStatus = request => {
    console.log(request.headers);
    if (!request.headers.authorization) {
        return false
    }
    const token = request.headers.authorization.split(" ")[1]
    console.log(token);
    const loggedInUser = jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            return false
        }
        else {
            return data
        }
    });
    console.log(loggedInUser)
    return loggedInUser
}

router.post("/api/users/oauth", async function (req, res) {
    try {
        const token = req.body.tokenId
        const userInfo = await verify(token)
        console.log("token: ", userInfo)
        let result = await OAuthUser.findOne({ user_id: userInfo.user_id }).populate("check_ins.cafe_id")
        if (!result) {
            result = await OAuthUser.create(userInfo)
        }
        console.log("Database Entry: " + result)
        res.send(result)
    } catch (err) {
        console.error(err)
    }
})


// Unused route to like a cafe
router.post("/api/users/cafes/:cafeId", async function (req, res) {
    try {
        let updated = OAuthUser.findOneAndUpdate(
            {
                user_id: req.body.user_id
            },
            {
                $push: { liked_cafes: req.params.cafeId },
                new: true
            })
        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})

// Route to check in at a cafe
router.post("/api/users/checkin/:cafeId", async function (req, res) {
    try {
        console.log("cafe_id: " + req.params.cafeId)
        console.log("req.body: ", req.body)
        let checkInObj = {
            cafe_id: req.params.cafeId,
            timestamp: req.body.date
        }
        console.log(checkInObj)
        let success = await OAuthUser.findOneAndUpdate({ user_id: req.body.user_id },
            {
                $push: {
                    check_ins: checkInObj
                },
            }
        )
        await Cafe.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.cafeId)
            },
            {
                $inc: { check_ins: 1 }
            })
        res.json(success.toJSON())
    } catch (err) {
        console.error(err)
        res.status(500).send("Error!")
    }
})

router.get("/users", (req, res) => {
    User.find().then(dbUsers => {
        res.json(dbUsers);
    }).catch(err => {
        console.log(err);
        res.status(500).end();
    })
})

router.post("/api/users/signup", (req, res) => {
    User.create({
        name: req.body.name,
        password: req.body.password
    }).then(newUser => {
        res.json(newUser);
    }).catch(err => {
        console.log(err);
        res.status(500).end();
    })
})

router.post("/api/users/login", (req, res) => {
    User.findOne({
        where: {
            email: req.body.email,
        }
    }).then(foundUser => {
        if (!foundUser) {
            return res.status(404).send("USER NOT FOUND")
        }
        if (bcrypt.compareSync(req.body.password, foundUser.password)) {
            const userTokenInfo = {
                email: foundUser.email,
                id: foundUser.id,
                name: foundUser.name
            }
            const token = jwt.sign(userTokenInfo, process.env.JWT_SECRET, { expiresIn: "2h" });
            return res.status(200).json({ token: token })
        } else {
            return res.status(403).send("wrong password")
        }
    })
})

router.get("/api/users/secretProfile", (req, res) => {
    const loggedInUser = checkAuthStatus(req);
    console.log(loggedInUser);
    if (!loggedInUser) {
        return res.status(401).send("invalid token")
    }
    User.findOne({
        where: {
            id: loggedInUser.id
        }
    }).then(dbUser => {
        res.json(dbUser)
    }).catch(err => {
        console.log(err);
        res.status(500).send("an error occured please try again later");
    })

})

module.exports = router