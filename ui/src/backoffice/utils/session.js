export const getToken = () => {
    return sessionStorage.getItem("anotea:access_token");
};

export const getSession = () => {
    return Object.keys(sessionStorage).reduce((acc, key) => {
        if (key.startsWith("anotea:")) {
            let propertyName = key.replace(/anotea:/g, "");
            acc[propertyName] = sessionStorage.getItem(key);
        }
        return acc;
    }, { profile: "anonymous" });
};

export const setSession = data => {
    Object.keys(data)
    .filter(k => !["iat", "exp", "sub"].includes(k))
    .forEach(k => sessionStorage.setItem(`anotea:${k}`, data[k]));
};

export const removeSession = () => {
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith("anotea:")) {
            sessionStorage.removeItem(key);
        }
    });
};
