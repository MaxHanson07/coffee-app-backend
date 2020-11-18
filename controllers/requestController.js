const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const Request = require("../models/requestModel")

const checkAuthStatus = request => {
    if (!request.headers.authorization) {
        return false
    }
    const token = request.headers.authorization.split(" ")[1]

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

// Get all requests
router.get("/api/requests", async function (req, res) {
    try {
        let requests = await Request.find({})
        res.json(requests)
    } catch (err) {
        console.error(err);
        res.status(500).send("An error has appeared!")
    }
})

// Get one request
router.get("/api/requests/:id", async function(req, res){
    try {
        let result = await Request.find({_id: mongoose.Types.ObjectId(req.params.id)})
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("An error has appeared!")
    }
})

// Create a request
router.post("/api/requests", async function (req, res) {
    try {
        let result = await Request.create(
            {
                username: req.body.username,
                email: req.body.email,
                cafe_name: req.body.cafe_name,
                cafe_address: req.body.cafe_address,
                notes: req.body.notes
            }
        )
        res.json(result)
    } catch (err) {
        console.error(err);
        res.status(500).send("An error has appeared!")
    }
})

// Delete a request
router.delete("/api/requests/:id", async function(req, res){
    const loggedInUser = checkAuthStatus(req);
    if(!loggedInUser){
        return res.status(401).send("Must be logged in")
    }
    console.log(loggedInUser);
    try {
        let result = await Request.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)})
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("An error has appeared!")
    }
})

module.exports = router;