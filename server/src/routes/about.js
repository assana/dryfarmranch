//
//
// Copyright 2020 DigitalPaso LLC
//
//
const express 		= require ("express");
const passport 		= require ("passport");
const rateLimit 	= require ("express-rate-limit");
const {User} 		= require ("../models/user.js");
const middleware	= require ("../middleware/authenticate.js");
const sharp 		= require ('sharp');
const mongoose 		= require ('mongoose');
const moment		= require ('moment'); 

require("connect-flash");

var router = express.Router({mergeParams: true, caseSensitive: true});

const saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
	req.app.locals.returnTo = req.session.returnTo;
    } else {
	req.app.locals.returnTo = req.session.returnTo = ('/');
    }
    next();
}

// ====================
// Routes
// ====================

//
// Landing page
//

router.get("/", async function (req, res)
{ 
    try {
	if ((req.cookies && req.cookies.DFR === "chelmo")
	    || req.isAuthenticated()
	    //|| (process.env.NODE_ENV === 'development')
	    ) {
	    return res.render('about');
	} else {
	    return res.redirect('/soon');
	}
    } catch (e) {
	console.log(e);
	res.render('empty', {message: e.message});
    }

}); 

module.exports = router;
