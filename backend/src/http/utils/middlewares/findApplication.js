module.exports = req => {

    let authorization = req.headers['authorization'];
    if (authorization && authorization.startsWith('ANOTEA-HMAC-SHA256 ')) {
        return authorization.replace(/ANOTEA-HMAC-SHA256 /, '').split(':')[0];
    }

    try {
        let url = new URL(req.headers['x-anotea-widget'] || req.headers['origin']);
        return url.host;
    } catch (e) {
        return 'unknown';
    }
};
