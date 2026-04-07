const { unauthorized } = require('@hapi/boom');
const moderateur = require('./moderateur');
const organisme = require('./organisme');
const financeur = require('./financeur');
const opco = require('./opco');
const admin = require('./admin');

module.exports = (db, regions, user) => {
    switch (user.profile) {
        case 'moderateur':
            return moderateur(db, user);
        case 'organisme':
            return organisme(db, regions, user);
        case 'financeur':
            return financeur(db, regions, user);
        case 'admin':
            return admin(db, regions, user);
        case 'opco':
            return opco(db, regions, user);
        default:
            throw unauthorized(`Le profile de l'utilistateur n'est pas valide`);
    }
};
