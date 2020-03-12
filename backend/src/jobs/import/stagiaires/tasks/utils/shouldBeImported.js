const md5 = require('md5');

const isFiltered = (filters, stagiaire) => {
    if (filters.codeRegion) {
        return filters.codeRegion === stagiaire.codeRegion;
    }
    if (filters.codeFinanceur) {
        return stagiaire.formation.action.organisme_financeurs.map(o => o.code_financeur).includes(filters.codeFinanceur);
    }
    return true;
};

const hasOptOut = async (db, stagiaire) => {

    let email = stagiaire.individu.email;
    let nbOptOut = await db.collection('optOut').countDocuments({ md5: md5(email) });
    return nbOptOut > 0;
};

module.exports = async (db, handler, filters, stagiaire) => {
    return isFiltered(filters, stagiaire) && handler.shouldBeImported(stagiaire) && !(await hasOptOut(db, stagiaire));
};
