const crypto = require("crypto");

module.exports = (apiKey, secret, data) => {
    let timestamp = data.timestamp || new Date().getTime();
    let signature = crypto.createHmac("sha256", secret)
    .update(`${timestamp}${data.method}${data.path}${data.body ? JSON.stringify(data.body) : ""}`)
    .digest("hex");

    return `ANOTEA-HMAC-SHA256 ${apiKey}:${timestamp}:${signature}`;
};

