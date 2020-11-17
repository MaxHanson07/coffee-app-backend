// import packages
const express = require("express");
const logger = require("morgan");
const PORT = process.env.PORT || 3001;
const cors = require("cors");
require('dotenv').config();

// Get it express!
const app = express();

// Run middleware
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions));
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

// Import and use routes
const cafeRoutes = require("./controllers/cafeController");
const roasterRoutes = require("./controllers/roasterController");
const requestRoutes = require("./controllers/requestController")
app.use(cafeRoutes);
app.use(roasterRoutes);
app.use(requestRoutes);

// Start listening
app.listen(PORT, function () {
  console.log(`API server now on port ${PORT}!`);
});
