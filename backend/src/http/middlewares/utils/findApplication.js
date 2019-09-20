module.exports = req => {

    let headers = req.headers;

    if (headers['x-anotea-widget']) {
        try {
            let url = new URL(headers['x-anotea-widget']);
            return url.host;
        } catch (e) {
            return 'unknown';
        }
    }

    let authorization = headers['authorization'];
    if (authorization && authorization.startsWith('ANOTEA-HMAC-SHA256 ')) {
        return authorization.replace(/ANOTEA-HMAC-SHA256 /, '').split(':')[0];
    }

    return 'unknown';
};
