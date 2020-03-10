const express = require('express');
const YAML = require('yamljs');
const path = require('path');
const swagger = require('swagger-ui-express');

module.exports = () => {

    // eslint-disable-next-line new-cap
    let router = express.Router();
    let apiSpecifications = YAML.load(path.join(__dirname, './v1-swagger.yml'));

    router.use('/api/v1/doc', swagger.serve, (req, res) => {
        let html = swagger.generateHTML(apiSpecifications);
        res.send(html);
    });

    return router;
};
