const Boom = require('boom');
const moderateur = require('./moderateur');
const organisme = require('./organisme');
const financeur = require('./financeur');
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
        default:
            throw Boom.unauthorized(`Le profile de l'utilistateur n'est pas valide`);
    }
};
