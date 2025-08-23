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
	return res.render('landing/soon', {});
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
	    {color: 'var(--bg-color7)', name:'7'},
	    {color: 'var(--bg-color2)', name:'2'},
	    {color: 'var(--light-maeve)', name:'Light Maeve'},
	    {color: 'var(--bg-colorA)', name:'A'},
	    {color: 'var(--bg-color6)', name:'6'},
	    {color: 'var(--bg-color8)', name:'8'},
	    {color: 'var(--bg-color9)', name:'9'},
	];

	const navbars = [
	    {color: 'var(--navbar-bg0)', name:'Maeve'},
	    {color: 'var(--navbar-bg1)', name:'1'},
	    {color: 'var(--navbar-bg2)', name:'2'},
	    {color: 'var(--bg-color7)', name:'7'},
	    {color: 'var(--bg-color2)', name:'2'},
	];

	const logos = [
	    {color: 'var(--theme-color-denim)',  name:'Denim'},
	    {color: 'var(--theme-color-leather)',name:'Leather'},
	    {color: 'var(--theme-color-leaf)',	 name:'Leaf'},
	];

	return res.render('demo/colors', {backgrounds, navbars, logos});
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
