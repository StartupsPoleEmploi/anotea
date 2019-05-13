const { transformObject } = require('../../../common/utils/stream-utils');
const { delay } = require('../../job-utils');
const computeScore = require('./utils/computeScore');
const findAvisReconciliables = require('./utils/findAvisReconciliables');

module.exports = (db, logger) => {

    return new Promise((resolve, reject) => {

        let stats = {
            imported: 0,
            error: 0,
        };

        db.collection('intercarif').find()
        .batchSize(10)
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
            }, { upsert: true })
            .catch(e => {
                logger.error(`Unable to import formation ${id}`, e);
                return stats.error++;
            });

            return 1;
        }))
        .on('data', data => {
            stats.imported += data;
        })
        .on('error', e => reject(e))
        .on('finish', () => stats.error ? reject(stats) : resolve(stats));
    });
};

