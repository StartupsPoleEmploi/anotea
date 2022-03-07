export const isPasswordStrongEnough = password => {
    return ((!(password === null || password === undefined || password === '')) && // mot de passe non vide
        (password.length >= 8) && // longueur minimale de huit caractères
        (/[0-9]/.test(password)) && // au moins un chiffre
        (/[a-z]/.test(password)) && // au moins une lettre minuscule
        (/[A-Z]/.test(password)) && // au moins une lettre majuscule
        (/[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g.test(password)) // au moins un caractère spécial;
    );
};
