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
	let findOptions = {
	    /*title: {$nin:['STAFF', 'SUPERVISOR']},*/
	    title: {$in:['UBER', 'ADMIN']},
	};
	let selectOptions = 'title firstname lastname _id bio';

	const employees = await User.find(findOptions).select(selectOptions);
	return res.render('about', {employees});
    } catch (e) {
	console.log(e);
	res.render('empty', {message: e.message});
    }

}); 

router.get("/chris", async function (req, res)
{ 
    try {
	const chris = User.find({name: 'Chris'});
	return res.render('about/chris', {});
    } catch (e) {
	console.log(e);
	res.render('empty');
    }

}); 

module.exports = router;
