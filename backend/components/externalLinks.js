module.exports = db => {

    const getLink = async (trainee, goto) => {

        const distance = 30; // km
        const postalCode = trainee.training.place.postalCode;
        const romeMapping = await db.collection('formacodeRomeMapping').aggregate([{
            $match: { formacodes: { $elemMatch: { formacode: trainee.training.formacode } } }
        }, {
            $group: { _id: '$codeROME' }
        }
        ]).toArray();
        const inseeMapping = await db.collection('inseeCode').findOne({ postalCode: postalCode });

        const romeList = romeMapping.map(mapping => {
            return mapping._id;
        });

        let rome = romeList[0];

        let insee = inseeMapping.insee ? inseeMapping.insee : postalCode;

        if (goto === 'lbb') {
            return `https://labonneboite.pole-emploi.fr/entreprises/commune/${insee}/rome/${rome}?d=${distance}`;
        } else {
            return `https://candidat.pole-emploi.fr/offres/recherche?lieux=${insee}&motsCles=${romeList.join(',')}&offresPartenaires=true&rayon=${distance}&tri=0`;
        }
    };

    return {
        getLink: getLink
    };
};
