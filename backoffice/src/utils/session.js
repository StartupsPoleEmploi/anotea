export const getToken = () => {
    return sessionStorage.getItem('anotea:access_token');
};

export const getSession = () => {
    return {
        id: sessionStorage.getItem('anotea:id'),
        profile: sessionStorage.getItem('anotea:profile'),
        codeRegion: sessionStorage.getItem('anotea:codeRegion'),
        codeFinanceur: sessionStorage.getItem('anotea:codeFinanceur'),
        raisonSociale: sessionStorage.getItem('anotea:raisonSociale'),
        features: sessionStorage.getItem('anotea:features'),
        access_token: sessionStorage.getItem('anotea:access_token'),
    };
};

export const setSession = data => {
    Object.keys(data)
    .filter(k => !['iat', 'exp', 'sub'].includes(k))
    .forEach(k => sessionStorage.setItem(`anotea:${k}`, data[k]));
};

export const removeSession = () => {
    sessionStorage.removeItem('anotea:id');
    sessionStorage.removeItem('anotea:profile');
    sessionStorage.removeItem('anotea:codeRegion');
    sessionStorage.removeItem('anotea:codeFinanceur');
    sessionStorage.removeItem('anotea:raisonSociale');
    sessionStorage.removeItem('anotea:features');
    sessionStorage.removeItem('anotea:access_token');
};
