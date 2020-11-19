const express = require("express");
const router = express.Router();
const User = require('../models/userModel')
const OAuthUser = require("../models/oauthUserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("280932498066-hj1erov9gsausin5g9v06g8j90md2egm.apps.googleusercontent.com");

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "280932498066-hj1erov9gsausin5g9v06g8j90md2egm.apps.googleusercontent.com",
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
        let result = await OAuthUser.findOne({user_id: userInfo.user_id})
        if (!result) {
            result = await OAuthUser.create(userInfo)
        }
        console.log("Database Entry: " + result)
        res.send(result)
    } catch (err) {
        console.error(err)
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

router.post("/signup", (req, res) => {
    User.create({
        // email: req.body.email,
        name: req.body.name,
        password: req.body.password
    }).then(newUser => {
        res.json(newUser);
    }).catch(err => {
        console.log(err);
        res.status(500).end();
    })
})

router.post("/login", (req, res) => {
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

router.get("/secretProfile", (req, res) => {
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