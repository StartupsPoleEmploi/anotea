const express = require('express');
const path = require('path');
const UglifyJS = require('uglify-js');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);

module.exports = ({ sentry }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let minifyWidgetLoader = async () => {
        let data = await readFile(path.join(__dirname, 'static/js/widget/anotea-widget-loader.js'), 'utf8');
        let { code, error } = UglifyJS.minify(data.toString());
        if (error) {
            sentry.sendError(error);
        }
        return code;
    };
    let minifiedWidgetLoader = minifyWidgetLoader();

    router.get('/static/js/widget/anotea-widget-loader.min.js', async (req, res) => {
        let code = await minifiedWidgetLoader;
        res.setHeader('Content-Length', Buffer.byteLength(code));
        res.set('Content-Type', 'application/javascript');
        res.send(new Buffer(code));
    });

    router.get('/static*', express.static(path.join(__dirname)));

    return router;
};
