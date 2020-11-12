const express = require("express");
const router = express.Router();
const axios = require("axios")

const mongoose = require("mongoose");
const Cafe = require("../models/cafeModel");
const Roaster = require("../models/roasterModel");

// Refresh the entire database 
async function refreshDatabase() {
    try {
        let cafeIds = await Cafe.find({}, '_id place_id')
        for (cafeId of cafeIds) {
            let place = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${cafeId.place_id}&fields=place_id,name,geometry/location/lat,geometry/location/lng,formatted_address,website,opening_hours/weekday_text,photos&key=${process.env.API_Key}`)
            let result = await Cafe.findOneAndUpdate(
                {
                    _id: mongoose.Types.ObjectId(cafeId._id)
                },
                {
                    place_id: place.data.result.place_id,
                    name: place.data.result.name,
                    lat: place.data.result.geometry.location.lat,
                    lng: place.data.result.geometry.location.lng,
                    address: place.data.result.formatted_address,
                    website: place.data.result.website,
                    weekday_text: place.data.result.opening_hours.weekday_text,
                    photos: place.data.result.photos // Google stores a 'photo reference' instead of a url. Maybe we should convert before saving into database
                })
            console.log(`Updated ${cafeId._id}: ${result}`)
        }
    } catch (err) {
        console.error(err)
    }
}

// Calls above function - remove in production, replace with cron job
router.get("/api/refresh", async function (req, res) {
    refreshDatabase();
    res.send("Running refresh")
})

// Route to seed database with coffee shops within 500m of my house
router.get("/api/seed", async function (req, res) {
    try {
        let radius = "1000"
        let response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=47.649349,%20-122.321053&radius=${radius}&keyword=coffee&key=${process.env.API_Key}`)
        let placeIds = response.data.results.map(place => place.place_id)
        for (id of placeIds) {
            let place = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=place_id,name,geometry/location/lat,geometry/location/lng,formatted_address,website,opening_hours/weekday_text,photos&key=${process.env.API_Key}`)
            console.log(place.data)
            let weekday_text;
            if (place.data.result.opening_hours){
                weekday_text = place.data.result.opening_hours.weekday_text
            } 
            let placeObj = {
                place_id: place.data.result.place_id,
                name: place.data.result.name,
                lat: place.data.result.geometry.location.lat,
                lng: place.data.result.geometry.location.lng,
                formatted_address: place.data.result.formatted_address,
                website: place.data.result.website,
                weekday_text: weekday_text,
                photos: place.data.result.photos, // Google stores a 'photo reference' instead of a url. Maybe we should convert before saving into database
                custom_data: {
                    likes: 0
                }
            }
            Cafe.create(placeObj)
        }
        res.redirect("/api/cafes")
    } catch (err) {
        console.error(err)
        res.set(500).send("An error has appeared!")
    }
})

// Search Places API by cafe name
router.get("/api/places/search/:cafename", async function (req, res) {
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
        res.set(500).send("An error has appeared!")
    }
})

// Search our database by name and address
router.get("/api/cafes/search/:nameaddress", async function(req, res) {
    try {
        console.log(req.params.nameaddress);
        let nameAddressArr = req.params.nameaddress.split(", ");
        let name = nameAddressArr[0];
        let address = nameAddressArr[1];
        let cafe;
        if (address) {
            cafe = await Cafe.find(
                {
                    name: { 
                        $regex: name, $options: "i" 
                    }, 
                    formatted_address: { 
                        $regex: address, $options: "i" 
                    }
                }).populate("custom_data.roaster")
        } else {
            cafe = await Cafe.find({name: {$regex: name, $options: "i"}}).populate("custom_data.roaster")
        }
        res.send(cafe)
    } catch (err) {
        console.error(err);
        res.set(500).send("An error has appeared!")
    }
})

// Get all cafes
router.get("/api/cafes", async function (req, res) {
    try {
        let result = await Cafe.find({}).populate("custom_data.roaster")
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error has appeared!")
    }
})

// Get one cafe
router.get("/api/cafes/:id", async function (req, res) {
    try {
        let result = await Cafe.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).populate("custom_data.roasters")
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error has appeared!")
    }
})

// Increment the likes for a given cafe
router.get("/api/cafes/like/:id", async function (req, res) {
    try {
        let result = await Cafe.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.id)
            },
            {
                $inc: { "custom_data.likes": 1 }
            })
        if (result) {
            res.send(`_id:${req.params.id} updated`)
        } else {
            res.set(404).send(`_id:${req.params.id} not found`)
        }
    } catch (err) {
        console.error(err);
        res.set(500).send("An error has appeared!")
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
            photos: req.body.photos, // Array
            custom_data: {
                roasters: [],
                photos: [],
                likes: 0
            }
        }
        let result = await Cafe.create(placeObj)
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error has appeared!")
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
                custom_data: req.body
            })
        if (req.body.roasters) {
            for (roaster_id of req.body.roasters) {
                let result = await Roaster.findOneAndUpdate(
                    {
                        _id: mongoose.Types.ObjectId(roaster_id),
                        cafes: {$ne: mongoose.Types.ObjectId(req.params.id)}
                    },
                    {
                        $push: {cafes: mongoose.Types.ObjectId(req.params.id)}
                    }
                    )
                console.log(result)
            }
        }
        res.json(updated)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error has appeared!")
    }
})

// Delete a cafe
router.delete("/api/cafes/:id", async function (req, res) {
    try {
        let result = await Cafe.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) })
        res.json(result)
    } catch (err) {
        console.error(err)
        res.set(500).send("An error has appeared!")
    }
})



module.exports = router;