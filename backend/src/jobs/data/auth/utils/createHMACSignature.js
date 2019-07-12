const crypto = require('crypto');

module.exports = (apiKey, secret, method, path, options = {}) => {
    let timestamp = options.timestamp || new Date().getTime();
    let signature = crypto.createHmac('sha256', secret)
    .update(`${timestamp}${method}${path}${options.body ? JSON.stringify(options.body) : ''}`)
    .digest('hex');

    return `ANOTEA-HMAC-SHA256 ${apiKey}:${timestamp}:${signature}`;
};

