/*
    provides seed data to database,
    run only once, and then data will be in database
 */

const mongoose = require("mongoose");
// double .. to backout once from the current directory and then look
const Campground = require("../models/campground");
//require cities file to use cities in seed database
const cities = require("./cities");

// const descriptors = require('./seedHelpers');
// const places = require('./seedHelpers');
// using destructuring to get both at once
const { descriptors, places, seedImages } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// to get random element from descriptors and places
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const price = Math.floor(Math.random() * 25) + 10;
        const random1000 = Math.floor(Math.random() * 1000);
        const rand52 = Math.floor(Math.random() * 52);
        const rand52_ = Math.floor(Math.random() * 52);
        const camp = new Campground({
            // owner: "6235c68fd1c118f3b645af9f",
            owner: "62508abd70b39b209ea73bac",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores ipsum aliquid odit officia, est ullam expedita sapiente repellendus, dolorum tenetur, commodi excepturi animi odio molestias modi similique quaerat facere tempore!",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },
            images: [
                {
                    url: seedImages[rand52].u,
                    filename: seedImages[rand52].fname,
                },
                {
                    url: seedImages[rand52_].u,
                    filename: seedImages[rand52_].fname,
                },
            ],
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
