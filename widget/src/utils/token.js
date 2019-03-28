const tokenKey = 'anotea:token';

export const getToken = () => {
    return sessionStorage.getItem(tokenKey);
};

export const setToken = token => {
    sessionStorage.setItem(tokenKey, token);
};

export const removeToken = () => {
    sessionStorage.removeItem(tokenKey);
};
