//
//
// Copyright 2020 DigitalPaso LLC
//
//
const multer = require ('multer');

var uploadImage = multer({ 
    //dest: '../public/uploads/',
    /*
    limits: {
        fileSize: 1000000       // megabytes
    },
    */
    fileFilter(req, file, callback) {
        if (!file.originalname.toLowerCase().match (/\.(png|jpeg|jpg|heic)$/)){
            callback (new Error ('Please upload a jpg or png file.'));
        }
        callback(undefined, true);
    }
});

var defaultImage = multer({ 
    dest: '../uploads/',
    limits: {
        fileSize: 1000000       // megabytes
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.toLowerCase().match (/\.(png|jpeg|jpg|heic)$/)){
            callback (new Error ('Please upload a jpg or png file.'));
        }
        callback(undefined, true);
    }
});

module.exports = {
    uploadImage,
    defaultImage
};
