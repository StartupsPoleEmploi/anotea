/* config-overrides.js */

module.exports = function override(config, env) {
    config.optimization.runtimeChunk = false;
    config.optimization.splitChunks = {
        cacheGroups: {
            default: false
        }
    };
    config.output.filename = 'static/js/anotea-widget.js';
    return config;
};
