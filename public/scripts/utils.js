//
//
// Copyright 2020 DigitalPaso LLC
//
//

const calcSlideRectForSwiper = () => {
    const navRect = document.querySelector('#mainNavBar').getBoundingClientRect();
    const captionRect = document.querySelector('#slideCaption').getBoundingClientRect();

    const w = window.innerWidth*0.5;
    const h = window.innerHeight - navRect.height - captionRect.height;
    return {w, h:300, navH: navRect.height};
}

const sendMediaTagToServer = async (size) =>
{
    try {
	let match = window.matchMedia("(max-width: 768px)").matches;
//console.log(window.innerWidth, screen.width, match);
	const res = await fetch('/workorder/isMobile', {
            method: "POST",
	    body: await JSON.stringify({match, innerWidth:window.innerWidth}),
            headers: { 'Content-Type': 'application/json'},
	    json: true
        });
    } catch (e) {
	console.log(e);
	return;
    }
}

const mediumDisplay = () =>
{
    if (window.matchMedia("(max-width: 768px)").matches) {
	// Viewport is less or equal to 700 pixels wide
	return 1;
    } else {
	return 0;
    }
}

const submitForm = async (form) =>
{
    const f = document.querySelector(`#${form}`);
    if (f)
	f.submit();
}

const getThemeColor = async () =>
{
    let color = '#ff0faf';
    color = '#ffDE00';
    let themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color');
    //if (!themeColor)
	themeColor = '#f0f0f0';//color;
	themeColor = color;
    const res = await fetch ('/themeColor', {
	method: "POST",
	body: await JSON.stringify({themeColor}),
	headers: { "Content-Type": "application/json"},
	json: true
    });
}

const min = (a, b) => {return (a<b?a:b);}
const max = (a, b) => {return (a>b?a:b);}

const calcSlideRect = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {w, h};
}

const setSlideRect = () => {
    const {width, height} = calcSlideRect(withCaption);
    document.querySelector('#slide').style.height = height;
    document.querySelector('#slide').style.width  = width;
}

const sizeImage = (slideRect, photo) => {
    //const slideRect = calcSlideRect();
    const padding = 0;//40;
    slideRect.w -= padding;
    slideRect.h -= padding;

    let scaleW = 1.0;
    if (photo.w > slideRect.w)
	scaleW = slideRect.w/photo.w;
    let scaleH = 1.0;
    if (photo.h > slideRect.h) 
	scaleH = slideRect.h/photo.h;
    const scale = min(scaleW, scaleH);
    const width = `${Math.ceil(photo.w*scale)}px`;
    return width;
}


const setupSlide = (slideRect, dir, photo, toggle) => 
{
/*
    document.querySelector('#slideCaption div').innerHTML = photo.title;
    document.querySelector('a#splitView').href = `/feed/${dir}/gallery/${photo.image}`;

    slideElement.opacity 	= 0.0;
    slideElement.visibility 	= "visible";
    const style = sizeImage(slideRect, photo: { w: photo.width, h: photo.height});
*/
    const style = {};
    return style;
}

const drawSlide = (slideRect, dir, photo, toggle) => 
{
    document.querySelector('#slideCaption div').innerHTML = photo.title;
    document.querySelector('a#splitView').href = `/feed/${dir}/gallery/${photo.image}`;

    const slide 	= `img#slide${toggle}`;
    const slideElement 	= document.querySelector(slide);
    const other 	= `img#slide${toggle^1}`;
    const otherElement 	= document.querySelector(other);

    slideElement.opacity 	= 0.0;
    slideElement.visibility 	= "visible";
    slideElement.style.width  	= sizeImage(slideRect, { w: photo.width, h: photo.height});
    slideElement.src 		= `/feed/${dir}/gallery/${photo.image}`;

    $(slide).stop(true, true);
    $(other).stop(true, true);
    $(slide).clearQueue();
    $(other).clearQueue();
    $(slide).animate ({opacity:1.0}, 1000, 'swing', function(){});
    $(other).animate ({opacity:0.0}, 1000, 'swing', function(){});

    return 1;
}

/* The year for the copyright */
const countdown = (date) => {
    var today = new Date();

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

const daysUntil = (date) =>
{
    date.setFullYear(year, month-1, day);
    var today = new Date();

    // The diff to the date, but we really only care about days, not milliseconds
    var days = (date.getTime() - today.getTime())/(86400*1000);
    return (Math.abs(Math.floor(days)));
}
const dumpHTML = () => {
    const body = document.querySelector('body').innerHTML;
    console.log (body);
}

const fileSelectedForUpload = (e) => 
{
    // FIX ME: check to see what form we are in
    // for avatar files
    $(document.querySelector('#avatarFilename')).removeClass('hideFilename');
    $(document.querySelector('#avatarFileUploadButton')).removeAttr('disabled');

    // for PDF files
    $(document.querySelector('#pdfFilename')).removeClass('hideFilename');
    $(document.querySelector('#pdfFileUploadButton')).removeAttr('disabled');
};

const enableButton = (b) => {
    (document.querySelector(`#${b}`)).removeAttribute('disabled');
};
const disableButton = (b) => {
    (document.querySelector(`#${b}`)).setAttribute('disabled','');
};

const disableSaveButton = async (b) =>
{
    document.querySelector(`#${b}`).setAttribute('disabled', '');
    document.querySelector(`#${b}`).classList.remove('btn-success');
    document.querySelector(`#${b}`).classList.add('btn-outline-secondary');
}

const enableSaveButton = async (b) =>
{
    document.querySelector(`#${b}`).removeAttribute('disabled');
    document.querySelector(`#${b}`).classList.remove('btn-outline-secondary');
    document.querySelector(`#${b}`).classList.remove('btn-outline-success');
    document.querySelector(`#${b}`).classList.add('btn-success');
}

var editList = [];
const testingFormChange = async (id) => {
    enableButton(`submitButton${id}`);
    editList.push(id);
}

const submitAll = async (changed, formName) => {
    try {
        for (let index=0; index<changed.length; index++) {
            if (changed[index]) {
                const form = document.querySelector(`#${formName}${index}`);
                var formData = new FormData(form);
                const json = await JSON.stringify(Object.fromEntries(formData));
                const response = await fetch (form.action, {
                    method: "PATCH",
                    body : json,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }
    } catch (e) {
        console.log(e);
    }
}

const resetAll = async (changed, formName) => {
    try {
        changed.forEach((p, index) => {
            if (p) {
                const form = document.querySelector(`#${formName}${index}`);
                if (form) {
                    form.reset();
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
}


const noRefresh = (e) => {
    console.log("No refresh!");
    e.preventDefault();
}

const noSubmitOnEnter = (e) => {
    if ( e.keyCode === 13 ) {
	e.preventDefault();
    } else if ( e.keyCode === 27) {
	// FIX-ME: Need to hide this element
    }
    return true;
}

const setColor = (color, index, tag, label) =>
{
const property = `--${tag}`;

    if (color != `var(${property})`) {
        const oldColor =
            getComputedStyle(document.documentElement).getPropertyValue(property);
        document.documentElement.style.setProperty(`${property}`, color);
    }
    const elements = document.querySelectorAll(label);
    elements.forEach((e, i) => {
        if (i === index)
            e.innerHTML = '*';
        else
            e.innerHTML = '';
    });
    return index;
}


const setThemeColor = (color, index) =>
{
    if (color != 'var(--theme-color)') {
        const oldColor =
            getComputedStyle(document.documentElement).getPropertyValue('--theme-color');
        document.documentElement.style.setProperty('--theme-color', color);
    }
    const elements = document.querySelectorAll('.currentThemeColor');
    elements.forEach((e, i) => {
        if (i === index)
            e.innerHTML = '*';
        else
            e.innerHTML = '';
    });
    return index;
}

const setNavbarColor = (color, index) =>
{
    if (color != 'var(--navbar-background)') {
        const oldColor =
            getComputedStyle(document.documentElement).getPropertyValue('--navbar-background');
        console.log (oldColor);
        document.documentElement.style.setProperty('--navbar-background', color);
    }

    const elements = document.querySelector('#mainNavBar');
    elements.forEach((e, i) => {
        if (i === index)
            e.innerHTML = '*';
        else
            e.innerHTML = '';
    });

    return index;
}

const setBackgroundColor = (color, index) =>
{
    if (color != 'var(--body-background)') {
        const oldColor =
            getComputedStyle(document.documentElement).getPropertyValue('--body-background');
        console.log (oldColor);
        document.documentElement.style.setProperty('--body-background', color);
    }
    const elements = document.querySelectorAll('.currentBgColor');
    elements.forEach((e, i) => {
        if (i === index)
            e.innerHTML = '*';
        else
            e.innerHTML = '';
    });
    return index;
}

