//
//
// Copyright 2020 DigitalPaso LLC
//
//
const mongoose  	= require ("mongoose");
const {uploadImage}     = require ("../middleware/avatar.js");

const sharp             = require ('sharp');
const fs        	= require ('fs');
const path      	= require('path');

const {DateTime} 	= require("luxon");
const {Service}		= require('../models/service.js');

const services = [
{name:		'asphalt',
 title:      	'Asphalt',
 details:    	'Here is everything you need to know about asphalt',
 icon: 		'steamroller.ejs',
 isPrivate: 	'false'
}, 
{name:		'concrete',
 title:      	'Concrete',
 details:    	'Here is everything you need to know about concrete',
 icon: 		'cement-truck.ejs',
 isPrivate: 	'false'
}, 
{name:		'maintenance',
 title:      	'Repairs & Maintenance',
 details:    	'Here is everything you need to know about repairs',
 icon: 		'project.ejs',
 isPrivate: 	'false'
}, 
/*
{name:		'grading',
 title:      	'Grading',
 details:    	'Here is everything you need to know about grading',
 icon: 		'bulldozer.ejs',
 isPrivate: 	'false'
}, 
{name:		'excavation',
 title:      	'Excavation',
 details:    	'Here is everything you need to know about excavation',
 icon: 		'excavator.ejs',
 isPrivate: 	'false'
}, 
{name:		'portfolio',
 title:      	'Portfolio',
 details:    	'Here is everything you need to know about my portfolio',
 icon: 		'portfolio.ejs',
 isPrivate: 	'false'
}, 
*/
];

const populateMissingServices = async () => 
{
    try {
	for (let i=0; i<services.length; i++) {
	    let s = await Service.findOne ({name: services[i].name});
	    if (!s) {
		console.log('Did not find', services[i].title);
		s = new Service ({...services[i], order: i});
		await s.save();
	    }
	}
    } catch (e) {
	console.log('Not Imported!', e);
    }

}

const populateServices = async () => 
{
    try {
	const conn = await mongoose.connection;
	const collection = await conn.db.collection('services');
	const count = await collection.count();
	if (count) {
	    console.log('Will drop all services', count);
	    const dropped = await collection.drop();
	} else {
	    console.log('No services found');
	}

	for (let i=0; i<services.length; i++) {
	    const s = new Service ({...services[i], order: i});
	    const saved = await s.save();
	}
    } catch (e) {
	console.log('Not Imported!', e);
    }

}

module.exports = {
    populateServices,
    populateMissingServices
};
