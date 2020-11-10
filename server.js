// import packages
const express = require("express");
const logger = require("morgan");
const PORT = process.env.PORT || 3001;
const cors = require("cors");
require('dotenv').config();

// Get it express!
const app = express();

// Run middleware
app.use(cors())
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Here comes the mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/coffeedb", { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
 });

// Serve up static assets when deployed
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Import and use routes
var cafeRoutes = require("./controllers/cafeController.js");
var roasterRoutes = require("./controllers/roasterController.js");
app.use(cafeRoutes);
app.use(roasterRoutes);

// Start listening
app.listen(PORT, function () {
  console.log(`API server now on port ${PORT}!`);
});
