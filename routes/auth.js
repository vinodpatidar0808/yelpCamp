const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const asyncError = require("../utilities/asyncError");

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post(
    "/register",
    asyncError(async (req, res) => {
        try {
            const { email, username, password } = req.body;
            const newUser = new User({ email, username });
            const registeredUser = await User.register(newUser, password);
            // console.log(registeredUser);
            // automatically login user after registering
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("Welcome to Yelp Camp");
                res.redirect("/campgrounds");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/register");
        }
    })
);

router.get("/login", (req, res) => {
    res.render("users/login");
});

// this middleware is from passport, failure: true-> shows a flash message on failure, failureRedirect:"/login" redirect to this route when login fails
router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }),
    (req, res) => {
        req.flash("success", "welcome back");
        const redirectUrl = req.session.returnTo || "/campgrounds";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Goodbye");
    res.redirect("/campgrounds");
});

module.exports = router;
