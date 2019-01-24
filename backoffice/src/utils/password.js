export const checkPasswordComplexity = password => {
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
