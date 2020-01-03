module.exports = req => {

    let headers = req.headers;

    let authorization = headers['authorization'];
    if (authorization && authorization.startsWith('ANOTEA-HMAC-SHA256 ')) {
        return authorization.replace(/ANOTEA-HMAC-SHA256 /, '').split(':')[0];
    }

    try {
        let url = new URL(headers['x-anotea-widget'] || headers['origin']);
        return url.host;
    } catch (e) {
        return 'unknown';
    }
};
