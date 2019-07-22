const fs = require('fs');
const parse = require('csv-parse');
const { writeObject, pipeline, ignoreFirstLine } = require('../../../../common/utils/stream-utils');

module.exports = async (db, logger, file) => {

    let stats = {
        refreshed: 0,
        invalid: 0,
        total: 0,
    };

    await pipeline([
        fs.createReadStream(file),
        parse({
            delimiter: '|',
            columns: [
                'c_nomcorrespondance',
                'c_prenomcorrespondance',
                'c_adresseemail',
                'c_telephone1',
                'c_telephone2',
                'c_validitemail_id',
                'dn_individu_national',
                'dn_session_id',
                'dc_aes_recue',
                'dc_referencement',
                'c_individulocal',
                'dc_formation_id',
                'dc_origine_session_id',
                'dc_lblformation',
                'dd_datedebutmodule',
                'dd_datefinmodule',
                'dc_organisme_id',
                'dc_cp_lieuformation',
                'dc_ville_lieuformation',
                'dc_formacode_ppal_id',
                'dn_certifinfo_1_id',
                'dc_lblcertifinfo',
                'dc_siret',
                'dc_lblorganisme',
                'dc_raisonsociale',
                'departement',
                'dc_niveauformation_entree_id',
                'dc_niveauformation_sortie_id',
                'dn_dureehebdo',
                'dn_dureemaxi',
                'dn_dureeentreprise',
                'dc_dureeindicative',
                'dn_nombreheurescentre',
                'dc_numeroicsession',
                'dc_numeroicaction',
                'kn_session_id',
                'liste_financeur',
            ],
        }),
        ignoreFirstLine(),
        writeObject(async record => {
            stats.total++;

            let siret = record['dc_siret'];
            let label = record['dc_lblorganisme'];
            let name = record['dc_raisonsociale'];

            let trainee = await db.collection('trainee').findOne({
                'trainee.email': record['c_adresseemail'].toLowerCase(),
                'training.infoCarif.numeroSession': record['dc_numeroicsession'],
            });

            if (!trainee) {
                return Promise.resolve();
            }

            return Promise.all([
                db.collection('comment').updateOne(
                    {
                        'token': trainee.token,
                    },
                    {
                        $set: {
                            'training.organisation.siret': siret,
                            'training.organisation.label': label,
                            'training.organisation.name': name,
                        }
                    }
                ),
                db.collection('trainee').updateOne(
                    {
                        'token': trainee.token,
                    },
                    {
                        $set: {
                            'training.organisation.siret': siret,
                            'training.organisation.label': label,
                            'training.organisation.name': name,
                        }
                    }
                ),
            ])
            .then(results => {
                if (results.find(r => r.result.nModified > 0)) {
                    stats.refreshed++;
                }
            })
            .catch(e => {
                stats.invalid++;
                logger.error(e);
            });
        }, { parallel: 25 }),
    ]);

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
