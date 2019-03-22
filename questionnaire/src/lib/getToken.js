export default () => {
    let urlParts = window.location.href.split('/');
    let token = urlParts[urlParts.length - 1];

    if (!token || !new RegExp('[A-Fa-f0-9]{64}').test(token)) {
        throw new Error(`Invalid token ${token}`);
    }
    return token;
};
