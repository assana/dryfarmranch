//
//
// Copyright 2020 DigitalPaso LLC
//
//
const express 		= require ("express");
const passport 		= require ("passport");
const {User} 		= require ("../models/user.js");
const middleware	= require ("../middleware/authenticate.js");
const validator 	= require ('validator');
const sharp 		= require ('sharp');
const mongoose 		= require ('mongoose');
const moment		= require ('moment'); 

require("connect-flash");

var router = express.Router({mergeParams: true, caseSensitive: true});

router.use((req, res, next) => 
{
    if (req.cookies && req.cookies.DFR && (req.cookies.DFR === "Cookie")){
	next();
    } else {
	res.render("demo/login");
    }
})


// ====================
// Routes
// ====================

//
// Demo Landing page
//
router.get("/", async function (req, res)
{ 
    try {
	return res.redirect('/');
    } catch (e) {
	console.log(e);
	res.render('empty', {message: e});
    }
}); 


router.post('/themeColor', async function (req, res)
{
    req.app.locals.fillColor = req.body.themeColor;
/*
console.log('[0] follColor in locals', req.app.locals.fillColor);
*/
    res.send ('ok');
});

router.get("/colors", async function (req, res)
{
    try {
	const backgrounds = [
	    {bg: 'var(--bg-color5)', name:'5'},
	    {bg: 'var(--bg-color6)', name:'6'},
	    {bg: 'var(--bg-color0)', name:'0'},
	    {bg: 'var(--bg-color2)', name:'2'},
/*
	    {bg: 'var(--bg-color3)', name:'3'},
	    {bg: 'var(--bg-color1)', name:'1'},
	    {bg: 'var(--bg-color4)', name:'4'},
*/
	];

	const logo = [
	    {bg: 'var(--theme-color)',   name:'Leather'},
	    {bg: 'var(--theme-color-denim)', name:'Denim'},
	];

	return res.render('demo/colors', {backgrounds, logo});
    } catch (e) {
	res.redirect('/');
    }
});

router.get("/clearCookies", async function (req, res)
{ 
    try {
	res.clearCookie ('DFR');
	req.flash('success', 'Cookies cleared.');
	return res.redirect('/');
    } catch (e) {
	console.log(e);
	req.flash('error', 'Could not clear cookies.');
	return res.redirect('');
    }
}); 

router.get("/destroySession", async function (req, res)
{ 
    try {
	req.session.destroy();
	console.log('Session destroyed.');
	return res.redirect('back');
    } catch (e) {
	console.log(e);
	req.flash('error', 'Could not destroy session.');
	return res.redirect('back');
    }
}); 

router.get("/logo", async function (req, res)
{
    if (process.env.NODE_ENV === 'development') {
	res.render('demo/logo', {});
    } else {
	res.redirect('/');
    }
});

router.get("/fonts", async function (req, res)
{
    try {
	    return res.render('demo/fonts');
    } catch (e) {
	res.redirect('/');
    }
});

module.exports = router;
