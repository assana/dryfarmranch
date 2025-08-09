//
//
// Copyright 2020 DigitalPaso LLC
//
//
const fs        = require('fs');
const filepath = `${__dirname}/../`;

const current = 'A0.';
const offset = 0;

const version = () => {
    try {
        const dataBuffer = fs.readFileSync(`${filepath}/version.txt`);
        const version = parseInt(dataBuffer.toString()) + offset;
	return (`${current}${version}`);
    } catch (e) {
        return 0;
    }
}

module.exports = {version};
