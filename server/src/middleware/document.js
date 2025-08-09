//
//
// Copyright 2020 DigitalPaso LLC
//
//
const multer = require ('multer');

var uploadPDF = multer({ 
    //dest: '../public/uploads/',
    fileFilter(req, file, callback) {
        if (!file.originalname.toLowerCase().match (/\.(pdf)$/)){
            callback (new Error ('Please upload a PDF file.'));
        }
        callback(undefined, true);
    }
});

module.exports = {
    uploadPDF
};
