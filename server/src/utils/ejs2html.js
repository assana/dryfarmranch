//
//
// Copyright 2021 DigitalPaso LLC
//
//
var fs          = require('fs');
const ejs       = require("ejs");
const path      = require('path');

const ejs2html = async (filePath, information) => {

    // filePath: filePath to ejs file
    try {
	const templatePath = path.resolve(__dirname, filePath);
	const ejsString = ejs.fileLoader(templatePath, 'utf8');
	const options = {filename: templatePath, root: ['../../../public']};
        const template = await ejs.compile(ejsString, options);
        const html = await template(information);
	if (process.env.NODE_ENV != 'production') {
	    // Only print in dev and test mode
	    var pieces = templatePath.split(path.sep);
	    const outputHtml = pieces[pieces.length-1].replace('.ejs', '.html')
	    await fs.writeFileSync(`/var/tmp/${outputHtml}`, html);
	}
        return html;
    } catch (e) {
        console.log(e);
        return 0;
    }
};

module.exports = {ejs2html};
