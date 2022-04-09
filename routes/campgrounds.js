const express = require("express");
const router = express.Router();
const asyncError = require("../utilities/asyncError");
const multer = require("multer");
const { storage } = require("../cloudinary/config");
const upload = multer({ storage });

const { isLoggedIn, validateCampground, isOwner } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");

router
    .route("/")
    .get(asyncError(campgrounds.index))
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        asyncError(campgrounds.createCampground)
    );

// order of routes matter, if /campground/new was after campgrounds/:id , this new string in request will be treated as id
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
    .route("/:id")
    .get(asyncError(campgrounds.showCampground))
    .patch(
        isLoggedIn,
        isOwner,
        upload.array("image"),
        validateCampground,
        asyncError(campgrounds.updateCampground)
    )
    .delete(isLoggedIn, isOwner, asyncError(campgrounds.destroyCampground));

router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    asyncError(campgrounds.renderEditForm)
);

module.exports = router;
