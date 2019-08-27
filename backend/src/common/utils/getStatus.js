module.exports = avis => {
    if (avis.archived === true) {
        return 'Archivé';
    } else if (avis.published === true || avis.comment === undefined || avis.comment === null) {
        return 'Publié';
    } else {
        return 'En attente de modération';
    }
};
