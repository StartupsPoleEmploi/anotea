export default () => {
    let urlParts = window.location.href.split('/');
    let token = urlParts[urlParts.length - 1];

    if (!token) {
        throw new Error(`Invalid token ${token}`);
    }
    return token;
};
