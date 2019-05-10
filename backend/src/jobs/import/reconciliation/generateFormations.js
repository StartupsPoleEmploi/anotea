const { transformObject } = require('../../../common/utils/stream-utils');
const computeScore = require('./utils/computeScore');
const findAvisReconciliables = require('./utils/findAvisReconciliables');

module.exports = db => {

    return new Promise((resolve, reject) => {

        let imported = 0;

        db.collection('intercarif').find()
        .project({
            '_attributes': 1,
            '_meta': 1,
            'intitule_formation': 1,
            'organisme_formation_responsable': 1,
            'actions.organisme_formateur': 1,
        })
        .pipe(transformObject(async formation => {

            let sirets = formation.actions.reduce((acc, action) => {
                return [
                    ...acc,
                    action.organisme_formateur.siret_formateur.siret,
                ];
            }, []);

            let avis = await findAvisReconciliables(db, formation, { sirets });

            let id = formation._attributes.numero;
            await db.collection('formationsReconciliees').replaceOne({ _id: id }, {
                _id: id,
                numero: formation._attributes.numero,
                intitule: formation.intitule_formation,
                domaine_formation: {
                    formacodes: formation._meta.formacodes,
                },
                certifications: {
                    certifinfos: formation._meta.certifinfos,
                },
                organisme_responsable: {
                    raison_sociale: formation.organisme_formation_responsable.raison_sociale,
                    siret: formation.organisme_formation_responsable.siret_organisme_formation.siret,
                    numero: formation.organisme_formation_responsable._attributes.numero,
                },
                avis: avis || [],
                score: computeScore(avis),
                meta: {
                    import_date: new Date(),
                    source: {//TODO remove source field in v2
                        numero_formation: formation._attributes.numero,
                        type: 'intercarif',
                    },
                    reconciliation: {
                        //TODO must be converted into an array in v2
                        organisme_formateurs: sirets,
                        certifinfos: formation._meta.certifinfos,
                        formacodes: formation._meta.formacodes,
                    },
                },
            }, { upsert: true });

            return { inserted: 1 };
        }))
        .on('data', data => {
            imported += data.inserted;
        })
        .on('error', e => reject(e))
        .on('finish', () => resolve({ imported }));
    });
};

