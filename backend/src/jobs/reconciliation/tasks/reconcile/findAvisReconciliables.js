const asSiren = require('../../../../core/utils/asSiren');

const getDepartement = codePostal => codePostal.substring(0, 2);

module.exports = async (db, intercarif, action) => {

    let adresse = action.lieu_de_formation.coordonnees.adresse;
    let siret = action.organisme_formateur.siret_formateur.siret;

    let avis = await db.collection('avis').find({
        'formation.action.organisme_formateur.siret': new RegExp(`^${asSiren(siret)}`),
        'status': { $in: ['validated', 'rejected'] },
        '$and': [
            {
                '$or': [
                    { 'formation.certifications.certif_info': { $in: intercarif._meta.certifinfos } },
                    { 'formation.domaine_formation.formacodes': { $in: intercarif._meta.formacodes } },
                ]

            },
            {
                '$or': [
                    {
                        'formation.action.lieu_de_formation.code_postal': adresse.codepostal,
                    },
                    {
                        $and: [
                            {
                                'formation.action.lieu_de_formation.code_postal': {
                                    $not: /^(75|690|130)/
                                }
                            },
                            {
                                'formation.action.lieu_de_formation.code_postal': {
                                    $regex: new RegExp(`^${getDepartement(adresse.codepostal)}`)
                                },
                                'formation.action.lieu_de_formation.ville': adresse.ville,
                            },
                        ]
                    }
                ]

            }
        ],
    })
    .project({
        _id: 1,
        token: 1,
        formation: 1,
        notes: 1,
        date: 1,
        commentaire: 1,
        status: 1,
        reponse: 1,
        codeRegion: 1,
    })
    .toArray();

    let certifiants = avis.filter(a => {
        return !!a.formation.certifications.find(c => intercarif._meta.certifinfos.includes(c.certif_info));
    });

    return { action, avis: certifiants.length > 0 ? certifiants : avis };
};
