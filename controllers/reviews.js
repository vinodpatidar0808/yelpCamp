const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    const now = new Date();
    review.date = new Intl.DateTimeFormat("en-IN", {
        dateStyle: "short",
        timeStyle: "medium",
    }).format(now);
    review.owner = req.user._id;
    campground.reviews.unshift(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created New review");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    //pull operator of mongo to delete review from campground
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
};
