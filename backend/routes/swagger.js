const express = require('express');
const YAML = require('yamljs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

module.exports = () => {

    // eslint-disable-next-line new-cap
    let router = express.Router();
    let apiSpecifications = YAML.load(path.join(__dirname, './swagger.yml'));

    router.use('/doc', swaggerUi.serve, swaggerUi.setup(Object.assign({}, apiSpecifications)));

    return router;
};
