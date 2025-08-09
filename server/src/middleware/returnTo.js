//
//
// Copyright 2020 DigitalPaso LLC
//
//

const saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        req.app.locals.returnTo = req.session.returnTo;
    } else {
        req.app.locals.returnTo = req.session.returnTo = ('/');
    }
    next();
}

module.exports = {saveReturnTo};

