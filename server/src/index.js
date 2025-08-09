//
//
// Copyright 2020 DigitalPaso LLC
//
//
const {app} = require('./app.js');

const env = process.env.NODE_ENV || 'production';
var port = process.env.PORT || 5050;

if (env === 'development' || env === 'test') {
    //
    // Local host https
    //
    var path = require('path');
    var fs = require('fs');
    var https = require('https');

    var credentials = {
        key: fs.readFileSync(path.resolve('/Users/assana/Sites/LocalhostCertificates/server.key')),
        cert: fs.readFileSync(path.resolve('/Users/assana/Sites/LocalhostCertificates/server.crt'))
    }

    const server = https.createServer(credentials, app).listen(port, () => {
	console.log (`HTTPS: DryFarmRanch ${process.env.NODE_ENV} server is running on port ${port}.`);
    });

} else {
    app.listen(port, () => {
	console.log (`DryFarmRanch ${process.env.NODE_ENV} server is running on port ${port}.`);
    });
}
