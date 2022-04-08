const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { cloudinary } = require("../cloudinary/config");
const mbxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mbxToken });

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/indexnew", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground)
    // throw new expressError("Invalid Campground Data", 400);
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();
    // res.send("Ok");
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.owner = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", "successfully made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
    //nested populate -> populate reviews for campground and owner of each campgroud for reviews
    const campground = await Campground.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "owner" } })
        .populate("owner");
    // console.log(campground);
    if (!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // spreading the object from request
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    //imgs is  an array
    //TODO: update images with other data in one go--> efficient
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
        console.log(campground);
    }
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.destroyCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};
