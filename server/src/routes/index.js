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
const validator 	= require ('validator');
const sharp 		= require ('sharp');
const mongoose 		= require ('mongoose');
const moment		= require ('moment'); 
const axios             = require ('axios');
const { DateTime } 	= require ("luxon");

require("connect-flash");

/*
const {addIDs, updateUserInfo, populateDatabaseForTesting}       
    = require ('../utils/testData.js');
*/

const {sendInfoRequest, saveRejected} 
			= require('../utils/email.js');

const fs 	= require ('fs');
const path	= require('path');

var router = express.Router({mergeParams: true, caseSensitive: true});

const saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
	req.app.locals.returnTo = req.session.returnTo;
    } else {
	req.app.locals.returnTo = req.session.returnTo = ('/');
    }
    next();
}

const logUserAction = async (info) =>
{
    // Need to look up the user information, which we should have in the order
    try {
        const date = moment().format('MMM Do, h:mm:ss a');
	let msg = `${info.action}:\t${info.username}\t${date}\n`;
        await fs.appendFileSync(`/var/tmp/login.txt`, msg);
        return;
    } catch (e) {
        console.log('[logUserAction] Something went wrong.', e);
    }
}

// ====================
// Routes
// ====================

router.post('/themeColor', async function (req, res) 
{

    req.app.locals.fillColor = req.body.themeColor;
/*
console.log('[0] follColor in locals', req.app.locals.fillColor);
*/
    res.send ('ok');
});

//
// Landing pages
//

router.get("/", async function (req, res)
{ 
console.log("in landing.");
    try {
	if ((req.cookies && req.cookies.DFR === "chelmo")
	    || req.isAuthenticated()
	    //|| (process.env.NODE_ENV === 'development')
	    ) {
	    return res.render('landing/index');
	} else {
	    return res.redirect('/soon');
	}
    } catch (e) {
	console.log(e);
	res.render('empty', {message: `/landing: ${e}`});
    }

}); 

router.get("/soon", async function (req, res)
{ 
    try {
	return res.render('landing/soon', {});
    } catch (e) {
	console.log(e);
	res.render('empty');
    }

}); 


const shufflePhotos = (length) =>
{
    let list = [];
    for (let i=0; i<length; i++) {
        list[i] = i;
    }

    for (let i=0; i<length; i++) {
        const rand = Math.floor(Math.random()*length);
        const tmp1 = list[i];
        list[i] = list[rand];
        list[rand] = tmp1;
    }

    return list;
}


// =======================
// Contact form and button
// =======================

router.get("/contact", async (req, res) => { 
    try {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
	res.setHeader("Expires", "0");

	if ((req.cookies && req.cookies.DFR === "chelmo")
	    || req.isAuthenticated()
	    //|| (process.env.NODE_ENV === 'development')
	    ) {
	    return res.render("contact/index");
	} else {
	    return res.redirect('/soon');
	}
    } catch (e) {
	console.log(e);
	req.flash("error", e);
        res.status(500).redirect('/');
    }
}); 

router.get("/bot", async function (req, res)
{
    try {
        res.render('contact/bot');
    } catch (e) {
        console.log(e);
        res.render('empty', {message:'something went wrong.'});
    }
});

router.get("/call", async function (req, res)
{
    try {
        res.render('contact/call');
    } catch (e) {
        console.log(e);
        res.render('empty', {message:'something went wrong.'});
    }
});

router.post("/reCaptchaKey", async (req, res) =>
{
    // returns site key
    try {
        res.json({siteKey:process.env.reCAPTCHA_SITE_KEY});
    } catch(e) {
        res.send(e);
    }
});

router.post("/homepage", async (req, res) => { 

    try {
        const secret = `${process.env.reCAPTCHA_SECRET_KEY}`;
        const token = req.body.token;
        let response = await axios({
            method: 'post',
            url : `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
        });
        const recaptcha = response.data;
//console.log('Recaptcha:', recaptcha);

        if ((recaptcha.success != true) || (recaptcha.action != 'homepage')) {
	    console.log('Failed Recaptcha!');
            req.flash("error", "Something went wrong.");
            return res.redirect('/call');
        }

        if (recaptcha.score <= 0.5) {
            console.log('Low score!');
            req.flash("error", "Something went wrong.");
            return res.redirect('/bot');
        }

	return;

    } catch (e) {
	console.log(e);
        res.status(500).redirect('/');
    }
}); 

router.post("/contact", async (req, res) => { 

    try {
        const secret = `${process.env.reCAPTCHA_SECRET_KEY}`;
        const token = req.body.token;
        let response = await axios({
            method: 'post',
            url : `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
        });
        const recaptcha = response.data;
console.log('Recaptcha:', recaptcha);

        if ((recaptcha.success != true) || (recaptcha.action != 'submit')) {
	    console.log('Failed Recaptcha!');
	    saveRejected({...recaptcha, ...req.body});
            req.flash("error", "Unable to send message.");
            return res.redirect('/call');
        }

        if (recaptcha.score <= 0.5) {
            console.log('Low score!');
            req.flash("error", "Unable to send message.");
	    saveRejected({...recaptcha, ...req.body});
            return res.redirect('/bot');
        }

	let body = req.body;
	delete body.token;
        const confirmationEmail = await sendInfoRequest({
            ...recaptcha,
            ...body
        });

	const successMessage = `Thank you for your message! - ${recaptcha.score}`;
	req.flash("success", successMessage);
	return res.redirect('/');

    } catch (e) {
	console.log(e);
        res.status(500).redirect('/');
    }
}); 

//
// Generic Registration and Login route
//

router.get("/register", saveReturnTo, function (req, res)
{
    if (req.isAuthenticated()){
        return(res.redirect ('/'));
    }
    req.flash('error', "");
    req.flash('success', "");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.setHeader("Expires", "0");
    res.render("users/register", {order: undefined});
});

router.get("/login", saveReturnTo, function (req, res) 
{ 
    if (req.isAuthenticated()){
        return(res.redirect ('/users/profile'));
    }
    req.flash('error', "");
    req.flash('success', "");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.setHeader("Expires", "0");
    res.render("users/login");
}); 

router.post('/saveDemoCookie', async function (req, res, next)
{
    try {
	if (req.body.secret === 'chelmo') {
	    res.cookie('DFR', req.body.secret, 
		{ maxAge: 3600000, httpOnly: true });
	    req.flash('success', 'Welcome to Dry Farm Ranch!');
	    logUserAction ({action: 'cookie', username: 'Demo'});
	}

        return res.redirect('/');
    } catch (e) {
        console.log(e);
	req.flash('error', e);
        res.render('empty', {message: e});
    }
});

router.post('/login', async function (req, res, next)
{
    const redirects = {
	failureRedirect: '/',
	successRedirect: '/users/profile',
    };

    passport.authenticate('local', redirects, function(err, user, info) {
        if (err || !user) {
            req.flash('error', "Incorrect username/password. Please try again.");
            return res.redirect('/login');
        }

        req.login(user, function(err) {
            if (err) {
                req.flash('error', "Incorrect username/password. Please try again.");
                return res.redirect('/login');
            }

            // FIX-ME: returnTo URL is wrong
            var token = req.user.tokens[0].token;
	    logUserAction ({action: 'login', username: req.user.username});

            req.flash("success", "Welcome back "+req.user.firstname);
	    return res.header('x-auth', token).redirect('/users/profile');
        });
      })(req, res, next);
});

//
// Logout form
//
router.get("/logout", async function (req, res, next) 
{ 
    try {
	if (req.user) {
	    logUserAction ({action: 'logout', username: req.user.username});
	    req.logout(function(e) {
		if (e) { return next(e); }
		res.redirect('/');
		req.flash("success", "Good bye!");
	    });
	}
    } catch (e) {
	console.log(e);
	req.flash("error", "Logout failed!");
	res.redirect("/");
    }
}); 

module.exports = router;
