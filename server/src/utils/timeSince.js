//
//
// Copyright 2020 DigitalPaso LLC
//
//
const moment 		= require ('moment');
//const {DateTime} 	= require("luxon");

const timeSince = (date) => {

    const today = new Date();//moment();

    // The diff to the date, but we really only care about days, not milliseconds
    var days = (date.getTime() - today.getTime())/(86400*1000);
    if (days > 0) {
        // upcoming event
        var i = days/30;
        if (days < 2) {
            return ("Tomorrow");
        } else if (days < 7) {
            return ("In "+ days + " days");
        } else if (days < 54) {
            var i = days/7;
            if (i<1.5) {
                return ("Next week");
            } else {
                return ("In about "+ Math.round(i) + " weeks");
            }
        } else {
            var i = days/30;
            return ("In "+ Math.round(i) + " months");
        }
    } else {
        // past event
        days = Math.abs(days);
        if (days < 1) {
            return ("Today");
        } else if (days < 2) {
            return ("Yesterday");
        } else if (days < 7) {
            return (days + " days ago");
        } else if (days < 54) {
            var i = days/7;
            if (i<1.5) {
                return ("Last week");
            } else {
                return (Math.round(i) + " weeks ago");
            }
        } else {
            var i = Math.round(days/30);
            if (i<18) {
                return (i + " months ago");
            } else if (i<30){
                i = Math.round(i/12);
                return ("About " + i + " years ago");
            } else {
                i = Math.round(i/12);
                return (i + " years ago");
            }
        }
    }
}

module.exports = {
    timeSince
};
