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
