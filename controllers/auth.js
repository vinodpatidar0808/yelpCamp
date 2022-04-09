const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        // automatically login user after registering
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.loginUser = (req, res) => {
    req.flash("success", "welcome back");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye");
    res.redirect("/campgrounds");
};
