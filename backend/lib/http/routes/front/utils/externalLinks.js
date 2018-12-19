module.exports = db => {

    const staticLinks = [{ goto: 'clara', url: 'https://clara.pole-emploi.fr' }];

    const getLink = async (trainee, goto) => {

        const url = staticLinks.filter(link => link.goto === goto).map(link => {
            return link.url;
        });
        if (url.length) {
            return url[0];
        }

        const distance = 30; // km
        const postalCode = trainee.training.place.postalCode;

        let [romeMapping, inseeMapping] = await Promise.all([
            db.collection('formacodeRomeMapping').aggregate([{
                $match: { formacodes: { $elemMatch: { formacode: trainee.training.formacode } } }
            }, {
                $group: { _id: '$codeROME' }
            }]).toArray(),
            db.collection('inseeCode').findOne({ postalCode: postalCode })
        ]);

        const romeList = romeMapping.map(mapping => {
            return mapping._id;
        });

        let rome = romeList[0];
        let insee = inseeMapping ? inseeMapping.insee : postalCode;

        if (romeList.length > 0) {
            if (goto === 'lbb') {
                return `https://labonneboite.pole-emploi.fr/entreprises/commune/${insee}/rome/${rome}?d=${distance}`;
            } else {
                return `https://candidat.pole-emploi.fr/offres/recherche?lieux=${insee}&motsCles=${romeList.join(',')}&offresPartenaires=true&rayon=${distance}&tri=0`;
            }
        } else {
            return null;
        }
    };

    return {
        getLink: getLink
    };
};
