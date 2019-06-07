module.exports = reponse => {
    if (reponse.status === 'rejected') {
        return 'Rejetée';
    } else if (reponse.status === 'published') {
        return 'Publiée';
    } else {
        return 'En attente de modération';
    }
};