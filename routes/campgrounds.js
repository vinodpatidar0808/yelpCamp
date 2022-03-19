const express = require("express");
const router = express.Router();
const asyncError = require("../utilities/asyncError");

const Campground = require("../models/campground");
const { isLoggedIn, validateCampground, isOwner } = require("../middleware");

router.get(
    "/",
    asyncError(async (req, res, next) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

// order of routes matter, if /campground/new was after campgrounds/:id , this new string in request will be treated as id
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post(
    "/",
    isLoggedIn,
    validateCampground,
    asyncError(async (req, res, next) => {
        // if (!req.body.campground)
        // throw new expressError("Invalid Campground Data", 400);
        const campground = new Campground(req.body.campground);
        campground.owner = req.user._id;
        await campground.save();
        req.flash("success", "successfully made a new campground");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.get(
    "/:id",
    asyncError(async (req, res, next) => {
        //nested populate -> populate reviews for campground and owner of each campgroud for reviews
        const campground = await Campground.findById(req.params.id)
            .populate({ path: "reviews", populate: { path: "owner" } })
            .populate("owner");
        console.log(campground);
        if (!campground) {
            req.flash("error", "Cannot find that campground");
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/show", { campground });
    })
);

router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    asyncError(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash("error", "Cannot find that campground");
            return res.redirect("/campgrounds");
        }

        res.render("campgrounds/edit", { campground });
    })
);

router.patch(
    "/:id",
    isLoggedIn,
    isOwner,
    validateCampground,
    asyncError(async (req, res) => {
        const { id } = req.params;
        // spreading the object from request
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
        });
        req.flash("success", "Successfully updated campground");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    asyncError(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted campground");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
