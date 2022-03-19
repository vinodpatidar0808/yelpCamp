const expressError = require("./utilities/ExpressError");
const {
    campgroundValidationSchema,
    reviewValidationSchema,
} = require("./validationSchemas.js");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    //isAuthenticated --> this is a passport methdod.
    // console.log("REQ user:", req.user);
    //console.log(req.path, req.originalUrl)
    req.session.returnTo = req.originalUrl;
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be signed in first");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new expressError(msg, 400);
    } else {
        next();
    }
    // console.log(result);
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.owner.equals(req.user._id)) {
        req.flash("error", "You do not have persmission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new expressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isReviewOwner = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.owner.equals(req.user._id)) {
        req.flash("error", "You do not have persmission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};
