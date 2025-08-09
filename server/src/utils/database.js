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
const {User}		= require('../models/user.js');
const {Project}		= require('../models/project.js');
const {Timesheet}	= require('../models/timesheet.js');
const {Workorder}	= require('../models/workorder.js');


const databaseAction = async (opcode) => 
{
    try {
	switch (opcode) {
	case ('CreateIDs'):
	    await addIDs();
	    break;
	case ('IMPORT'):
	    const imports = await importEvents();
	    console.log('Imported:', imports);
	    break;
	case ('CLEAR_PHOTOS'):
	    const saved = await Event.updateMany({}, {"$set":{"photos": []}}, {"upsert": false});
	    console.log('Cleaned all photos', saved);
	    break;
	default:
	    console.log('Nothing to do');
	    break;
	}

	return;

    } catch(e) {
	console.log(e);
	return;
    }
}

module.exports = {
    loadEvents,
    importEvents,
    databaseAction,
};
