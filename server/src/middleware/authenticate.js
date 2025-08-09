//
//
// Copyright 2020 DigitalPaso LLC
//
//
// Middleware stuff

var {User} = require ("../models/user.js");

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next)
{
    if (req.isAuthenticated()){
	return next();
    }

    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please Login First!");
    req.flash("info", "Please Login First!");
    res.redirect("/login");
}

middlewareObj.isLoggedInWithAuthority = function (req, res, next)
{
    if (req.isAuthenticated()){
	if (req.user.title === 'STAFF') {
	    // user not uber
	    req.flash("error", "Permission denied!");
	    res.redirect("back");
	} else {
	    next();
	}
    } else {
	// user not logged in
	req.flash("error", "Please Login First!");
	req.session.returnTo = req.originalUrl;
	res.redirect("/login");
    }
}

middlewareObj.isLoggedInAsUberOrAdmin = function (req, res, next)
{
    if (req.isAuthenticated()){
	if (req.user.title === 'UBER' || req.user.title === 'ADMIN') {
	    next();
	} else {
	    // user not uber
	    console.log ("Permission denied! Must be logged in as Admin or Über user.", req.user.title);
	    req.flash("error", "Permission denied! Must be logged in as Admin or Über user.");
	    res.redirect("back");
	}
    } else {
	// user not logged in
	req.flash("error", "Please Login First!");
	req.session.returnTo = req.originalUrl;
	res.redirect("/login");
    }
}

middlewareObj.isLoggedInAsUber = function (req, res, next)
{
    if (req.isAuthenticated()){
	if (req.user.title === 'UBER') {
	    next();
	} else {
	    // user not uber
	    req.flash("error", "Permission denied! Must be logged in as Über user.");
	    res.redirect("back");
	}
    } else {
	// user not logged in
	req.flash("error", "Please Login First!");
	req.session.returnTo = req.originalUrl;
	res.redirect("/login");
    }
}
middlewareObj.isLoggedInAsAdmin = function (req, res, next)
{
    if (req.isAuthenticated()){
	if (req.user.title === 'ADMIN') {
	    next();
	} else {
	    // user not admin
	    req.flash("error", "Permission denied! Must be logged in as admin.");
	    res.redirect("back");
	}
    } else {
	// user not logged in
	req.flash("error", "Please Login First!");
	req.session.returnTo = req.originalUrl;
	res.redirect("/login");
    }
}

middlewareObj.isLoggedInAsSupervisor = function (req, res, next)
{
    if (req.isAuthenticated()){
	if (req.user.title === 'SUPERVISOR') {
	    next();
	} else {
	    // user not a supervisor
	    req.flash("error", "Permission denied! Must be logged in as supervisor.");
	    res.redirect("back");
	}
    } else {
	// user not logged in
	req.flash("error", "Please Login First!");
	req.session.returnTo = req.originalUrl;
	res.redirect("/login");
    }
}

middlewareObj.isLoggedInAsAdminOrSupervisor = function (req, res, next)
{
    if (req.isAuthenticated()){
	if (req.user.title === 'SUPERVISOR') {
	    next();
	} else if (req.user.isSupervisor === true) {
	    next();
	} else {
	    // user not admin
	    req.flash("error", "Permission denied! Must be logged in as admin or supervisor.");
	    res.redirect("back");
	}
    } else {
	// user not logged in
	req.flash("error", "Please Login First!");
	req.session.returnTo = req.originalUrl;
	res.redirect("/login");
    }
}

module.exports = middlewareObj;
