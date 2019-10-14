export const isPasswordStrongEnough = password => {
    if (password === null || password === undefined || password === '') {
        return false;
    }
    // length greater or equal 6
    if (password.length >= 6) {
        // has uppercase
        if ((/[A-Z]/.test(password))) {
            // has special char
            if (/[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g.test(password)) {
                return true;
            }
        }
    }
    return false;
};

export const isSamePassword = (password, passwordConfirm) => {
    return password === passwordConfirm;
};

export const passwordIsOK = (password, passwordConfirm) => {
    return isPasswordStrongEnough(password) && isSamePassword(password, passwordConfirm);
};
