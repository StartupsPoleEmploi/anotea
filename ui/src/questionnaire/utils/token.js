const tokenKey = "anotea:token";

export const getToken = () => {
    return sessionStorage.getItem(tokenKey);
};

export const getTokenFromUrl = () => {
    let urlParts = window.location.href.split("/");
    let token = urlParts[urlParts.length - 1];

    if (!token) {
        throw new Error(`Invalid token ${token}`);
    }
    return token;
};

export const setToken = token => {
    sessionStorage.setItem(tokenKey, token);
};

export const removeToken = () => {
    sessionStorage.removeItem(tokenKey);
};
