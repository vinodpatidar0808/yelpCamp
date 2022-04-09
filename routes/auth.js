const express = require("express");
const router = express.Router();
const passport = require("passport");
const asyncError = require("../utilities/asyncError");
const users = require("../controllers/auth");

router
    .route("/register")
    .get(users.renderRegister)
    .post(asyncError(users.registerUser));

// this middleware is from passport, failure: true-> shows a flash message on failure, failureRedirect:"/login" redirect to this route when login fails
router
    .route("/login")
    .get(users.renderLogin)
    .post(
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        users.loginUser
    );

router.get("/logout", users.logoutUser);

module.exports = router;
