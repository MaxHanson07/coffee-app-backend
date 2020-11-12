const express = require("express");
const router = express.Router();
const axios = require("axios")

const mongoose = require("mongoose");
const Cafe = require("../models/cafeModel")

// Refresh a place id for one cafe
async function refreshPlaceId(mongoId, placeId) {
    try {
        let newId = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id&key=${process.env.API_Key}`)
        result = await Cafe.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.id)
            },
            {
                place_id: newId
            })
        console.log(result)
    } catch (err) {
        console.error(err)
    }
}

// Route to seed database with coffee shops within 500m of my house
router.get("/api/seed", async function (req, res) {
    try {
        let radius = "500"
        let response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=47.649349,%20-122.321053&radius=${radius}&keyword=coffee&key=${process.env.API_Key}`)
        let placeIds = response.data.results.map(place => place.place_id)
        for (id of placeIds) {
            let place = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${process.env.API_Key}`)
            let placeObj = {
                place_id: place.data.result.place_id,
                name: place.data.result.name,
                lat: place.data.result.geometry.location.lat,
                lng: place.data.result.geometry.location.lng,
                address: place.data.result.formatted_address,
                website: place.data.result.website,
                weekday_text: place.data.result.opening_hours.weekday_text,
                photos: place.data.result.photos // Google stores a 'photo reference' instead of a url. Maybe we should convert before saving into database
            }
            Cafe.create(placeObj)
        }
        res.redirect("/api/cafes")
    } catch (err) {
        console.error(err)
        res.set(500).send("An Error!")
    }
})

// Search Places API by cafe name
router.get("/api/places/:cafename", async function (req, res) {
    try {
        let { data } = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${req.params.cafename}&inputtype=textquery&key=${process.env.API_KEY}`)
        let candidates = data.candidates
        // Promise.all waits until all promises resolve before returning the result of .map
        let places = await Promise.all(candidates.map(async candidate => {
            let { data } = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${candidate.place_id}&fields=place_id,name,geometry/location/lat,geometry/location/lng,formatted_address,website,opening_hours/weekday_text,photos&key=${process.env.API_Key}`)
            return data
        }))
        res.json(places)
    } catch (err) {
        console.error(err);
        res.set(500).send("An Error!")
    }
})

// Get all cafes
router.get("/api/cafes", async function (req, res) {
    try {
        let result = await Cafe.find({})
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error!")
    }
})

// Get one cafe
router.get("/api/cafes/:id", async function (req, res) {
    try {
        let result = await Cafe.find({ _id: mongoose.Types.ObjectId(req.params.id) })
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error!")
    }
})

// Add a cafe
router.post("/api/cafes", async function (req, res) {
    try {
        let placeObj = {
            place_id: req.body.place_id,
            name: req.body.name,
            lat: req.body.lat,
            lng: req.body.lng,
            formatted_address: req.body.formatted_address,
            website: req.body.website,
            weekday_text: req.body.weekday_text, // Array of strings
            photos: req.body.photos // Array
        }
        let result = await Cafe.create(placeObj)
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error!")
    }
})

// Edit a cafe
router.put("/api/cafes/:id", async function (req, res) {
    try {
        let updated = await Cafe.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.id)
            },
            {
                custom_data: {
                    roasters: req.body.roasters, // As an array
                    instagram_url: req.body.instagram_url,
                    photos: req.body.photos // As an array
                }
            })
        res.json(updated)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error!")
    }
})

// Delete a cafe
router.delete("/api/cafes/:id", async function (req, res) {
    try {
        let result = await Cafe.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) })
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error!")
    }
})



module.exports = router;