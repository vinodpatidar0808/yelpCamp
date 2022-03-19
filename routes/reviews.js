const express = require("express");
//mergeParams : true --> by default you won't have access to parameters like campground id here
const router = express.Router({ mergeParams: true });

const Review = require("../models/review");
const Campground = require("../models/campground");

const asyncError = require("../utilities/asyncError");
const expressError = require("../utilities/ExpressError");

// const { reviewValidationSchema } = require("../validationSchemas.js");

const { validateReview, isLoggedIn, isReviewOwner } = require("../middleware");
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, asyncError(reviews.createReview));

router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewOwner,
    asyncError(reviews.deleteReview)
);

module.exports = router;
