const Boom = require('boom');
const moderateur = require('./moderateur');
const financeur = require('./financeur');
const organisme = require('./organisme');

module.exports = (db, regions, user) => {
    switch (user.profile) {
        case 'moderateur':
            return moderateur(db, user);
        case 'financeur':
            return financeur(db, regions, user);
        case 'organisme':
            return organisme(db, regions, user);
        default:
            throw Boom.unauthorized(`Le profile de l'utilistateur n'est pas valide`);
    }
};
