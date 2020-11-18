const express = require("express");
const router = express.Router()
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const Roaster = require("../models/roasterModel")

// Get all roasters
router.get("/api/roasters", async function (req, res) {
    try {
        let result = await Roaster.find({}).populate("cafes")
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("And error has appeared!")
    }
})

// Get one roaster
router.get("/api/roasters/:id", async function (req, res) {
    try {
        let result = await Roaster.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).populate("cafes")
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("And error has appeared!")
    }
})

// Search by roaster
router.get("/api/roasters/search/:name", async function (req, res) {
    try {
        let roaster = await Roaster.find(
            {
                name: {
                    $regex: req.params.name, $options: "i"
                }
            })
        if (roaster.length < 1) {
            throw("No roasters found")
        }
        res.json(roaster)
    } catch (err) {
        console.error(err)
        res.status(404).send(err)
    }
})

// Add a roaster
router.post("/api/roasters", async function (req, res) {
    try {
        let newRoaster = await Roaster.create({
            name: req.body.name,
            instagram_url: req.body.instagram_url,
            photos: req.body.photos, // As an array
            website: req.body.website
        })
        res.json(newRoaster)
    } catch (err) {
        console.error(err)
        res.status(500).send("Server error")
    }
})

// Edit a roaster
router.put("/api/roasters/:id", async function (req, res) {
    try {
        if (req.body.cafeId) {
            await Roaster.findOneAndUpdate({
                _id: mongoose.Types.ObjectId(req.params.id)
            },
                {
                    $push: { cafes: mongoose.Types.ObjectId(req.body.cafeId) }
                },
                {
                    new: true
                })
        }
        let updated = await Roaster.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(req.params.id)
        },
            {
                name: req.body.name,
                instagram_url: req.body.instagram_url,
                photos: req.body.photos, // As an array
                website: req.body.website
            }
        )
        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})

// Delete a roaster
router.delete("/api/roasters/:id", async function (req, res) {
    try {
        let result = await Roaster.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) })
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("And error has appeared!")
    }
})


module.exports = router;