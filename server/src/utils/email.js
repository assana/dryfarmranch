//
//
// Copyright 2020 DigitalPaso LLC
//
//
const moment    = require ("moment");

const {ejs2html}= require ('./ejs2html.js');

const fs	= require ('fs');
const ejs       = require ("ejs");
const path      = require ('path');
const sgMail 	= require ('@sendgrid/mail');

const sendgridAPIKey = process.env.SENDGRID_API_KEY; 
sgMail.setApiKey(sendgridAPIKey);

const saveAccepted = async (info) => 
{
    // Need to look up the user information, which we should have in the order
    try {

	//
	// Create email for Pedro
	//
        const date = moment().format('MMM Do, YYYY');
	let msg = `${date}\tscore: ${info.score}\n`;
	msg= `${msg}Name: ${info.name}\nemail: ${info.email}\n`;
	msg= `${msg}Message: ${info.details}\n==========\n`;
console.log(msg);
        await fs.appendFileSync(`/var/tmp/captchaReject.txt`, msg);

	return;

    } catch (e) {
	console.log('[sendOrderConfirmation] Something went wrong.', e);
    }
}

const saveRejected = async (info) => 
{
    // Need to look up the user information, which we should have in the order
    try {

	//
	// Create email for Pedro
	//
        const date = moment().format('MMM Do, YYYY');
	let msg = `${date}\tscore: ${info.score}\n`;
	msg= `${msg}Name: ${info.name}\nemail: ${info.email}\n`;
	msg= `${msg}Message: ${info.details}\n==========\n`;
console.log(msg);
        await fs.appendFileSync(`/var/tmp/captchaReject.txt`, msg);

	return;

    } catch (e) {
	console.log('[sendOrderConfirmation] Something went wrong.', e);
    }
}

const sendInfoRequest = async (infoRequest) => 
{
    // Need to look up the user information, which we should have in the order
    try {

	//
	// Create email for Pedro
	//
	const pathname = path.join(__dirname, '../views/contact/infoRequestEmail.ejs');
        const date = moment().format('MMM Do, YYYY');
        const html = await ejs2html (pathname, {date, infoRequest});

	if (process.env.NODE_ENV === 'production') {
	    const email = {
		to:		'assana@digitalpaso.com',
		subject: 	'Information request from website.',
		from:		'info@digitalpaso.com',
		html:		html
	    };
	    await sgMail.send(email);	
	    console.log('[Real] Sent info request email!');
	} else if (process.env.NODE_ENV === 'development'){
	    const email = {
		to:		'assana@digitalpaso.com',
		subject: 	'Information request from website.',
		from:		'info@digitalpaso.com',
		html:		html
	    };
	    if (0) {
		await sgMail.send(email);	
	    } else {
		await fs.writeFileSync(`/tmp/email.html`, html);
	    }
	    console.log('[To Assana] Sent info request email!');
	}
	return html;

    } catch (e) {
	console.log('[sendOrderConfirmation] Something went wrong.', e);
    }
}

module.exports = {
    sendInfoRequest,
    saveRejected,
};
