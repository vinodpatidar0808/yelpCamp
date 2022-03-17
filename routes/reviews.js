const express = require("express");
//mergeParams : true --> by default you won't have access to parameters like campground id here
const router = express.Router({ mergeParams: true });

const Review = require("../models/review");
const Campground = require("../models/campground");

const asyncError = require("../utilities/asyncError");
const expressError = require("../utilities/ExpressError");

const { reviewValidationSchema } = require("../validationSchemas.js");

const validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new expressError(msg, 400);
    } else {
        next();
    }
};

router.post(
    "/",
    validateReview,
    asyncError(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash("success", "Created New review");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:reviewId",
    asyncError(async (req, res) => {
        //pull operator of mongo to delete review from campground
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Successfully deleted review");
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
