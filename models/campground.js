const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review");

const ImageSchema = new Schema({ url: String, filename: String });

const opts = { toJSON: { virtuals: true } };

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_500,h_300,ar_1.0");
});

const CampgroundSchema = new Schema(
    {
        title: String,
        images: [ImageSchema],
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        price: Number,
        description: String,
        location: String,
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
    },
    opts
);

CampgroundSchema.virtual("properties.popUpText").get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            },
        });
    }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
