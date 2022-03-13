/*
    provides seed data to database,
    run only once, and then data will be in database
 */

const mongoose = require('mongoose');
// double .. to backout once from the current directory and then look
const Campground = require("../models/campground");
//require cities file to use cities in seed database
const cities = require("./cities");


// const descriptors = require('./seedHelpers');
// const places = require('./seedHelpers');
// using destructuring to get both at once
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


// to get random element from descriptors and places
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        });
        await camp.save();
    }
}

seedDB().then( ()=>{
    mongoose.connection.close();
});