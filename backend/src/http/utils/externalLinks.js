module.exports = (db, communes) => {

    const staticLinks = [{ goto: 'clara', url: 'https://clara.francetravail.fr' }];

    const getLink = async (stagiaire, goto) => {

        const url = staticLinks.filter(link => link.goto === goto).map(link => {
            return link.url;
        });
        if (url.length) {
            return url[0];
        }

        const distance = 30; // km
        const codePostal = stagiaire.formation.action.lieu_de_formation.code_postal;

        let [romeMapping, commune] = await Promise.all([
            db.collection('formacodeRomeMapping').aggregate([{
                $match: { 'formacodes.formacode': { $in: stagiaire.formation.domaine_formation.formacodes } }
            }, {
                $group: { _id: '$codeROME' }
            }]).toArray(),
            communes.findCommuneByPostalCode(codePostal)
        ]);

        const romeList = romeMapping.map(mapping => {
            return mapping._id;
        });

        let rome = romeList[0];
        let inseeCode = commune ? commune.inseeCode : codePostal;

        if (romeList.length > 0) {
            if (goto === 'lbb') {
                return `https://labonneboite.francetravail.fr/entreprises/commune/${inseeCode}/rome/${rome}?d=${distance}`;
            } else {
                return `https://candidat.francetravail.fr/offres/recherche?lieux=${inseeCode}&motsCles=${romeList.join(',')}&offresPartenaires=true&rayon=${distance}&tri=0`;
            }
        } else {
            return null;
        }
    };

    return {
        getLink: getLink
    };
};
