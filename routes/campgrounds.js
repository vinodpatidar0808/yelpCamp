const express = require("express");
const router = express.Router();
const asyncError = require("../utilities/asyncError");
const expressError = require("../utilities/ExpressError");
const Campground = require("../models/campground");
const { campgroundValidationSchema } = require("../validationSchemas.js");

router.get(
    "/",
    asyncError(async (req, res, next) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

// order of routes matter, if /campground/new was after campgrounds/:id , this new string in request will be treated as id
router.get("/new", (req, res) => {
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

router.post(
    "/",
    validateCampground,
    asyncError(async (req, res, next) => {
        // if (!req.body.campground)
        // throw new expressError("Invalid Campground Data", 400);

        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash("success", "successfully made a new campground");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.get(
    "/:id",
    asyncError(async (req, res, next) => {
        const campground = await Campground.findById(req.params.id).populate(
            "reviews"
        );
        // console.log(campground);
        if (!campground) {
            req.flash("error", "Cannot find that campground");
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/show", { campground });
    })
);

router.get(
    "/:id/edit",
    asyncError(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });
    })
);

router.patch(
    "/:id",
    validateCampground,
    asyncError(async (req, res) => {
        const { id } = req.params;
        // spreading the object from request
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
        });
        req.flash("success", "Successfully updated campground");
        res.redirect(`/campgrounds/${id}`);
    })
);

router.delete(
    "/:id",
    asyncError(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted campground");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
