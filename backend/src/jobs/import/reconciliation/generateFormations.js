const { transformObject } = require('../../../common/utils/stream-utils');
const computeScore = require('./utils/computeScore');
const findAvisReconciliables = require('./utils/findAvisReconciliables');

module.exports = async db => {

    await db.collection('formationsReconciliees').removeMany({});

    return new Promise((resolve, reject) => {

        let inserted = 0;

        db.collection('intercarif').find()
        .pipe(transformObject(async formation => {

            let sirets = formation.actions.reduce((acc, action) => {
                return [
                    ...acc,
                    action.organisme_formateur.siret_formateur.siret,
                ];
            }, []);

            let avis = await findAvisReconciliables(db, formation, { sirets });

            await db.collection('formationsReconciliees').insertOne({
                _id: `${formation._attributes.numero}`,
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
            });

            return { inserted: ++inserted };
        }))
        .on('data', data => {
            inserted += data.inserted;
        })
        .on('error', e => reject(e))
        .on('finish', () => resolve({ imported: inserted }));
    });
};

