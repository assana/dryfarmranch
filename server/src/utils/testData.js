//
//
// Copyright 2022 DigitalPaso LLC
//
//
const {User}		= require ("../models/user.js");
const {Project}		= require ("../models/project.js");
const {Workorder}	= require ("../models/workorder.js");
const {Timesheet}	= require ("../models/timesheet.js");
const {Paycheck}	= require ("../models/paycheck.js");
const {Timeoff}		= require ("../models/timeoff.js");

const passport          = require ("passport");
const sharp             = require ('sharp');
const fs                = require ('fs');
const path              = require ('path');
const moment		= require ('moment');

const { DateTime } = require("luxon");


const updateUserInfo = async () => 
{

console.log('Updating user info');

    try {
	let selectOptions = { avatar: 0 };
	const employees = await User.find().select (selectOptions);
	if (!employees) {
	    throw new Error('No user!');
	}

	const threeMonthsAgo = DateTime.now().minus({months:3});
	for (let i=0; i<employees.length; i++) {
	    let emp = employees[i];
	    if (emp.title === 'Uber') emp.title = 'UBER'; 
	    if (emp.title === 'Admin') emp.title = 'ADMIN';
	    if (emp.title === 'Supervisor') emp.title = 'SUPERVISOR';
	    if (emp.title === 'Staff') emp.title = 'STAFF';
	    await emp.save();
	}


    } catch (e) {
	console.log(e);
        return;
    }
}

const testUsers = [
{
    firstname: 	"Aspargus",
    lastname:	"Aspargioni",
    username:	"aspargus@digitalpaso.com",
    email:	"aspargus@digitalpaso.com",
    startDate:	DateTime.fromObject({year: 2022, month: 4, day: 13}).toISODate(),
    title:	"SUPERVISOR"
},
{
    firstname: 	"Brussel",
    lastname:	"Sprout",
    username:	"brussel@digitalpaso.com",
    email:	"brussel@digitalpaso.com",
    startDate:	DateTime.fromObject({year: 2022, month: 11, day: 1}).toISO()
},
{
    firstname: 	"Celery",
    lastname:	"Root",
    username:	"celery@digitalpaso.com",
    email:	"celery@digitalpaso.com",
    startDate:	DateTime.local().toISO()
},
{
    firstname: 	"Daikon",
    lastname:	"Raddish",
    username:	"daikon@digitalpaso.com",
    email:	"daikon@digitalpaso.com",
    startDate:	DateTime.fromObject({year: 2022, month: 2, day: 24}).toISO()
},
];

const populateDatabaseForTesting = async () => 
{
    try {
        const defaultPath = path.join(__dirname, '../../assets');
        var buffer = await fs.readFileSync(`${defaultPath}/default.png`);
        buffer = await sharp(buffer)
            .rotate()
            .resize({width: 1024, height: 1024})
            .jpeg()
            .toBuffer();
	for (let i=0; i<testUsers.length; i++) {
	    const d 		= await User.findOneAndRemove ({firstname: testUsers[i].firstname});
	    const u 		= {...testUsers[i]};
	    u.avatar 		= buffer;
	    u.password 		= `user${i}`;
	    u.probEndDate	= DateTime.fromISO(u.startDate).plus({months: 3}).toISODate();
console.log('Start:', u.startDate);
console.log('End:', u.probEndDate);
	    const user 		= new User(u);
	    const saved 	= await User.register(user, user.password);
	}
    } catch (e) {
	console.log(e);
	return;
    }

};


const addIDs = async () => {
    try {

	let i=0;
	const employees = await User.find();
	for (i=0; i<employees.length; i++) {
	    if (!employees[i].employeeID){
		employees[i].employeeID = ((new Date).getTime()&0x7fffffff).toString(16)
		await employees[i].save();
	    } else {
		console.log('employeeID:', i, employees[i].employeeID);
	    }
	}
	console.log('Fixed employees:', i);

	const projects = await Project.find();
	for (i=0; i<projects.length; i++) {
	    if (!projects[i].projectID){
		projects[i].projectID = ((new Date).getTime()&0x7fffffff).toString(16)
		await projects[i].save();
	    } else {
		console.log('projectID:', i, projects[i].projectID);
	    }
	}
	console.log('Fixed projects:', i);

	const workorders = await Workorder.find();
	for (i=0; i<workorders.length; i++) {
	    if (!workorders[i].orderID){
		workorders[i].orderID = ((new Date).getTime()&0x7fffffff).toString(16)
		await workorders[i].save();
	    } else {
		console.log('orderID:', i, workorders[i].orderID);
	    }
	}
	console.log('Fixed workorders:', i);

	const timesheets = await Timesheet.find();
	for (i=0; i<timesheets.length; i++) {
	    if (!timesheets[i].timesheetID){
		timesheets[i].timesheetID = ((new Date).getTime()&0x7fffffff).toString(16)
		await timesheets[i].save();
	    } else {
		console.log('TimesheetID:', i, timesheets[i].timesheetID);
	    }
	}
	console.log('Fixed timesheets:', i);

    } catch (e) {
	console.log(e);
	return;
    }
}

module.exports = {
    addIDs,
    updateUserInfo,
    populateDatabaseForTesting
};
