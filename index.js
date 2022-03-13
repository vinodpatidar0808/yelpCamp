const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require('method-override');




mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("Open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}))

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})

})

// order of routes matter, if /campground/new was after campgrounds/:id , this new string in request will be treated as id
app.get("/campgrounds/new",  (req,res)=>{
  res.render("campgrounds/new")
})

app.post("/campgrounds", async (req,res)=>{
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
;})


app.get("/campgrounds/:id",async (req,res)=>{
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", {campground});
})

app.get("/campgrounds/:id/edit", async (req,res)=>{
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit",{campground});
})

app.patch("/campgrounds/:id", async (req,res)=>{
  const {id} = req.params;
  // spreading the object from request
  const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground});
  res.redirect(`/campgrounds/${id}`);
})

app.delete("/campgrounds/:id", async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
} )

app.listen(3000, () => {
  console.log("serving on port 3000");
});
