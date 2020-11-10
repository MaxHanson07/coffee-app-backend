const express = require("express");
const router = express.Router()

const mongoose = require("mongoose");
const Roaster = require("../models/roasterModel")

// Get all roasters
router.get("/api/roasters", function (req, res) {
    Roaster.find({})
        .then(result => res.json(result))
        .catch(err => {
            console.error(err)
            res.set(500).send("An error!")
        })
})

// Get one roaster
router.get("/api/roasters/:id", function (req, res) {
    Roaster.find({_id: mongoose.Types.ObjectId(req.params.id)})
        .then(result => res.json(result))
        .catch(err => {
            console.error(err)
            res.set(500).send("An error!")
        })
})

// Add a roaster
router.post("/api/roasters", async function (req, res) {
    console.log(req.body)
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
        res.set(500).send("Server error")
    }
})

// Edit a roaster
router.put("/api/roasters/:id", async function (req, res) {
    try {
        if (req.body.cafeId) {
            let updated = await Roaster.findOneAndUpdate({
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
        res.set(500).send(err)
    }
})

// Delete a roaster
router.delete("/api/cafes/:id", function(req, res) {
    Roaster.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)})
        .then(result=>res.json(result))
        .catch(err => {
            console.error(err)
            res.set(500).send("An error!")
        })
})


module.exports = router;