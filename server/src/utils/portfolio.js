//
//
// Copyright 2020 DigitalPaso LLC
//
//

const fs                = require ('fs');
const path              = require ('path');

const portfolioThumbnails = async (name) =>
{
    try {
        let photos = [];
        if (!name)
            return;

        let assetPath = path.join(publicPath, `/assets/${name}`);
        if (fs.existsSync(assetPath)) {
            const options = {encoding: 'binary', withFileTypes: true};
            const dataBuffer = fs.readdirSync(assetPath, options);
            const data = await JSON.stringify (dataBuffer);
            photos = await JSON.parse (data);
            const found = photos.findIndex(element => !element.name.includes('.jpg'));
            photos.splice(found, 1);
        }

        assetPath = `/assets/${name}`;
        photos.forEach((p, i) => {
            photos[i] = `${assetPath}/${p.name}`;
        });

        const info = {
            path: assetPath,
            photos,
            currentSlide: 0,
            increment: photos.length
        }
        return info;
    } catch (e) {
        console.log(e);
        res.status(500).redirect('/');
    }
}


module.exports = {
    portfolioThumbnails,
};
