const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const asyncError = require("./utilities/asyncError");
const expressError = require("./utilities/ExpressError");
const Review = require("./models/review");

const {
    campgroundValidationSchema,
    reviewValidationSchema,
} = require("./validationSchemas.js");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("Open", () => {
    console.log("Database connected");
});

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("home");
});

app.get(
    "/campgrounds",
    asyncError(async (req, res, next) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

// order of routes matter, if /campground/new was after campgrounds/:id , this new string in request will be treated as id
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

const validateCampground = (req, res, next) => {
    const { error } = campgroundValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new expressError(msg, 400);
    } else {
        next();
    }
    // console.log(result);
};

const validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new expressError(msg, 400);
    } else {
        next();
    }
};

app.post(
    "/campgrounds",
    validateCampground,
    asyncError(async (req, res, next) => {
        // if (!req.body.campground)
        // throw new expressError("Invalid Campground Data", 400);

        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.get(
    "/campgrounds/:id",
    asyncError(async (req, res, next) => {
        const campground = await Campground.findById(req.params.id).populate(
            "reviews"
        );
        console.log(campground);
        res.render("campgrounds/show", { campground });
    })
);

app.get(
    "/campgrounds/:id/edit",
    asyncError(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });
    })
);

app.patch(
    "/campgrounds/:id",
    validateCampground,
    asyncError(async (req, res) => {
        const { id } = req.params;
        // spreading the object from request
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
        });
        res.redirect(`/campgrounds/${id}`);
    })
);


app.delete(
    "/campgrounds/:id", 
    asyncError(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    })
);

app.post(
    "/campgrounds/:id/reviews",
    validateReview,
    asyncError(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.delete(
    "/campgrounds/:id/reviews/:reviewId",
    asyncError(async (req, res) => {
        //pull operator of mongo to delete review from campground
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${id}`);
    })
);

app.all("*", (req, res, next) => {
    next(new expressError("Page not found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode);
    if (!err.message) err.message = "Oh no, something went wrong!";
    res.render("error", { err });
});

app.listen(3000, () => {
    console.log("serving on port 3000");
});
