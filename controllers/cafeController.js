const express = require("express");
const router = express.Router();
const axios = require("axios")

const mongoose = require("mongoose");
const Cafe = require("../models/cafeModel");
const Roaster = require("../models/roasterModel");

// Function to convert Google's photo_references to urls
async function convertReferencesToUrls(photoArray) {
    try {
        let photos = await Promise.all(photoArray.slice(0, 2).map(async photo => {
            let result = await axios.get(`https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxheight=500&maxwidth=500&key=${process.env.API_KEY}`)
            let photoURL = "https://" + result.request.socket._host + result.request.socket._httpMessage.path
            photo.photo_url = photoURL
            return photo
        }))
        return photos;
    } catch (err) {
        console.error(err)
    }
}

// Search Places API by cafe name
router.get("/api/places/search/:cafename", async function (req, res) {
    try {
        let { data } = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${req.params.cafename}&inputtype=textquery&key=${process.env.API_KEY}`)
        console.log(data)
        if (data.status === 'REQUEST_DENIED') {
            throw("Google Places Error! : " + data.error_message)
        }
        let candidates = data.candidates
        // Promise.all waits until all promises resolve before returning the result of .map
        let places = await Promise.all(candidates.map(async candidate => {
            let { data } = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${candidate.place_id}&fields=place_id,name,geometry/location/lat,geometry/location/lng,formatted_address,website,opening_hours/weekday_text,photos&key=${process.env.API_Key}`)
            return data
        }))
        res.json(places)
    } catch (err) {
        console.error(err);
        res.status(500).send("An error has appeared!")
    }
})

// Search our database by name and address
router.get("/api/cafes/search/:nameaddress", async function (req, res) {
    try {
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
                }).populate("roasters")
        } else {
            cafe = await Cafe.find({ name: { $regex: name, $options: "i" } }).populate("roasters")
        }
    if (cafe.length < 1) {
        throw("No results")
    }
    res.send(cafe)
    } catch (err) {
        console.error(err);
        res.status(404).send(err)
    }
})

// Get all cafes
router.get("/api/cafes", async function (req, res) {
    try {
        let result = await Cafe.find({}).populate("roasters")
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("An error has appeared!")
    }
})

// Get one cafe
router.get("/api/cafes/:id", async function (req, res) {
    try {
        let result = await Cafe.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).populate("roasters")
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("An error has appeared!")
    }
})

// Increment the likes for a given cafe
router.put("/api/cafes/like/:id", async function (req, res) {
    try {
        let result = await Cafe.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.id)
            },
            {
                $inc: { likes: 1 }
            },
            {
                new: true
            })
        if (result) {
            res.send(`_id:${req.params.id} updated`)
        } else {
            res.status(404).send(`_id:${req.params.id} not found`)
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error has appeared!")
    }
})

// Add a cafe
router.post("/api/cafes", async function (req, res) {
    try {
        let cafe = req.body
        cafe.likes = 0
        if (cafe.roasters) {
            cafe.roasters = cafe.roasters.map(roaster=>mongoose.Types.ObjectId(roaster))
        }
        let result = await Cafe.create(cafe)
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("An error has appeared!")
    }
})

// Edit a cafe
router.put("/api/cafes/:id", async function (req, res) {
    try {
        let updated = await Cafe.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.id)
            },
            req.body,
            {
                new: true
            })
        if (req.body.roasters) {
            for (roaster_id of req.body.roasters) {
                let result = await Roaster.findOneAndUpdate(
                    {
                        _id: mongoose.Types.ObjectId(roaster_id),
                        cafes: { $ne: mongoose.Types.ObjectId(req.params.id) }
                    },
                    {
                        $push: { cafes: mongoose.Types.ObjectId(req.params.id) }
                    },
                    {
                        new: true
                    }
                )
            }
        }
        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).send("An error has appeared!")
    }
})

// Delete a cafe
router.delete("/api/cafes/:id", async function (req, res) {
    try {
        let result = await Cafe.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) })
        res.json(result)
    } catch (err) {
        console.error(err)
        res.status(500).send("An error has appeared!")
    }
})

// Return photo url from photo reference
router.post("/api/photos", async function (req, res) {
    try {
        let photosWithUrls = await convertReferencesToUrls(req.body.photos)
        res.json(photosWithUrls)
    } catch (err) {
        res.status(500).send("Error")
    }
})


module.exports = router;