//
//
// Copyright 2022 DigitalPaso LLC
//
//
const {User}		= require ("../models/user.js");
const {Timesheet}	= require ("../models/timesheet.js");
const {Paycheck}	= require ("../models/paycheck.js");
const {Timeoff}		= require ("../models/timeoff.js");

const passport          = require ("passport");
const sharp             = require ('sharp');
const fs                = require ('fs');
const path              = require ('path');

const moment		= require ('moment');
const { DateTime } = require("luxon");

const populateUserData = async (id) =>
{
    try {
	let employee = await User.findById(id).select ({"avatar":0, "tokens":0});
	if (!employee) {
	    throw new Error('No user!');
	}

	// FIX-ME... this is moot once we are done with development 
	if (!employee.probEndDate) {
	    let prob = DateTime.fromISO(employee.startDate).plus({months: 3}).toISODate();
            employee = await employee.save();
        }

	const sortOptions = { createdAt: -1 };
	let selectOptions = { createdAt: 0, updatedAt: 0};
	await employee.populate([{
	    path: 'paychecks',
	    select: selectOptions,
            options: { sort: sortOptions }
        }, {
            path: 'timeoff',
	    select: selectOptions,
            options: { sort: { "requested.for": 1 } }
	}, {
            path: 'timesheet',
	    select: selectOptions, 
	}, {
            path: 'crew',
	    select: {"avatar":0, "tokens":0}
        }]);

	if (employee.crew) {
	    for (let i=0; i<employee.crew.length; i++) {
		await (employee.crew[i]).populate({
		    path: 'timesheet'
		});
	    }
	}
	employee.isUber = (employee.title === 'UBER');
	employee.isAdmin = (employee.title === 'ADMIN');
	employee.isSupervisor = (employee.title === 'SUPERVISOR');
	employee.isOnProbation = (DateTime.now() < employee.probEndDate);

        return {employee};

    } catch (e) {
        console.log(e);
        return {};
    }

}

const createNewTimesheet = async (id) => 
{
    try {
	const timesheet = new Timesheet({
	    employee: id,
	    punchIn: [],
	    total: 0,
	    timesheetID:  ((new Date).getTime()&0x7fffffff).toString(16),
	    isSubmitted: false});
	const saved = await timesheet.save();
	return saved;
    } catch (e) {
        console.log(e);
        return {};
    }
}

const createNewTimeoff = async (id) => 
{
    try {
	const vacation 	= await (new Timeoff({employee: id, type: 'VACATION'})).save();
	const sick 	= await (new Timeoff({employee: id, type: 'SICK'})).save();
	const disability= await (new Timeoff({employee: id, type: 'DISABILITY'})).save();
	return timeoff;
    } catch (e) {
        console.log(e);
        return {};
    }
}

const addToTimesheet = async (id, info) =>
{
    try {

	const hours = info.hours;

        // granularity is 15 minutes
        const wholeHours        = Math.floor(info.hours);
        const fractionHours     = info.hours - wholeHours;
        const quarters          = Math.ceil(((fractionHours)*4)%4);
        info.hours              = wholeHours + quarters * 0.25;

        const user = await User.findById(id);
        if (!user) {
            throw new Error ('No valid user logged in!');
        }
        await user.populate({
            path: 'timesheet',
            options: { sort: { createdAt: -1 } }
        });

        let timesheet;
        if (!user.timesheet) {
            timesheet = await createNewTimesheet(id);
        } else {
            // just save the date in the time card we found
            timesheet = user.timesheet;
        }

        let newPunchIn = {...info};
        newPunchIn.date = info.date;
	newPunchIn.projectID = info.projectID;
        const rate = user.hourlyRate;

        timesheet.punchIn.unshift(newPunchIn);
        timesheet.punchIn.sort(function(a,b){return b.date - a.date});

        let total = 0;
        timesheet.punchIn.forEach((p) => {
            total += p.hours * rate;
        });
        timesheet.total = total;
        const saved = await timesheet.save();

        return saved;

    } catch (e) {
        console.log(e);
        return 0;
    }
}

module.exports = {
    addToTimesheet,
    createNewTimesheet,
    populateUserData,
    createNewTimeoff,
};
