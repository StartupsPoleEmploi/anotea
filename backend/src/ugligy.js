const UglifyJS = require('uglify-js');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const path = require('path');

let uglify = async () => {
    let data = await readFile(path.join(__dirname, 'http/public/static/js/widget/anotea-widget-loader.js'), 'utf8');
    let { code, error } = UglifyJS.minify(data.toString());
    if (error) {
        throw new Error(error);
    }

    console.log(code);
};

uglify();
