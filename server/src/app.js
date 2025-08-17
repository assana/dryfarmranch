//
//
// Copyright 2020 DigitalPaso LLC
//
//
const express 			= require("express");
const app 			= express();	// needs to come before request
const bodyParser		= require("body-parser");
const rateLimit 		= require("express-rate-limit");
const rateLimitMongoStore	= require('rate-limit-mongo');
const mongoose			= require("mongoose");
const {User}    		= require("./models/user.js");
const passport            	= require("passport");
const LocalStrategy       	= require("passport-local");
const passportLocalMongoose 	= require("passport-local-mongoose");
const methodOverride		= require("method-override");
const flash               	= require("connect-flash");
const path      		= require('path');
const moment    		= require('moment');
const {version}                 = require('./utils/version');

const publicPath = path.join(__dirname, '../../public');

//
// Factored out routes...
//
const indexRoutes		= require("./routes/index.js");
const aboutRoutes		= require("./routes/about.js");
const demoRoutes                = require("./routes/demo.js");

//
// Local: setting env 
//

// 
// Globals
//
mongoUrl 		= process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/dryfarmranch";
mongoOptions = {
};

// Default connection
try {
    mongoose.connect(mongoUrl, mongoOptions);
} catch (e) {
    console.log(e);
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//
// Limit access to the site to prevent DOS attacks
//
const rateLimitReached = (req, res, options) => {
    console.log('Rate limit reached!');
    res.status(429).render("empty", {message: options.message});
};

var limiter;
if (process.env.NODE_ENV === 'production') {
console.log('This is the prod run.');
    limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 seconds
	limit: 100,
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
	message: "Rate limit reached. Please try back later.",
    });
} else {
    limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100,
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
	message: "[Testing] Rate limit reached. Please try back later.!",
    });
}


//
// Proxy troubleshooting: https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues
//
app.set('trust proxy', 1);
app.get('/ip', (req, res) => res.send(req.ip));
app.get('/x-forwarded-for', (req, res) => res.send(req.headers['x-forwarded-for']))

//
// Globlals
//
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(publicPath));
app.use(methodOverride("_method"));
app.use(express.json());        // automatically convert body to a json object

if ((process.env.NODE_ENV === 'production') || (process.env.NODE_ENV === 'test')) {
    app.use(limiter);
} 

//
// Session configuration
//
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoStore = MongoStore.create({
        mongoUrl: mongoUrl,
        mongooseConnection: mongoose.connection,
	dbName: 'dryfarmranch',
        autoRemove: 'native',
        autoRemoveInterval: 10,
        //touchAfter: 3600
});

//
// Express Session setting
//
const tenHours  = 36000000;
const oneHour   = 3600000;
const tenMinutes= 600000;
const oneMinute = 60000;
const tenSeconds= 10000;
const oneSecond = 1000;

let cookieMaxAge = oneHour;
if (process.env.NODE_ENV != 'production') {
    cookieMaxAge = tenHours;
}

const sessionOptions = {
    secret:		"Cookie is the silliest kitty in the world",
    resave:		false,
    saveUninitialized:	false, 
    cookie: { 
	maxAge: oneHour
    }, 
    store: mongoStore,
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//
// Cookie parser for demo mode
//
const cookieParser = require('cookie-parser')
app.use(cookieParser());

app.use(function(req, res, next){
    req.ejsActivePath = req.path.split('/')[1]; // [0] will be empty since routes start with '/'
    next();
});

app.use(function(req, res, next) {
    res.locals.currentUser 	= req.user;
    res.locals.error   		= req.flash("error");
    res.locals.success 		= req.flash("success");
    res.locals.showId 		= req.params.id;
    res.locals.activePath 	= req.ejsActivePath;
    res.locals.version    	= version();
    res.locals.cookie     	= req.cookies;
    res.locals.themeColor	= "var(--theme-color)";
    next();
});

mongoStore.on('create', (id) => {
    if (process.env.NODE_ENV === 'development') {
	console.log('[dryfarmranch] Session store created!', id);
    }
    // clean up all old sessions
});

app.locals.returnTo = "/";
app.locals.moment = moment;

app.use("/", 		indexRoutes);
app.use("/about", 	aboutRoutes);
app.use("/demo",	demoRoutes);

app.use((req, res, next) => {
  res.status(404).render("404");
})


module.exports = {app};
