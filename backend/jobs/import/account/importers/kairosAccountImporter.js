const fs = require('fs');
const parse = require('csv-parse');
const uuid = require('node-uuid');
const moment = require('moment-timezone');
const { handleBackPressure } = require('../../../utils');
const regions = require('../../../../components/regions');

module.exports = (db, logger) => {

    const { findCodeRegionByName } = regions(db);

    const buildAccount = async data => {
        const siret = parseInt(data['SIRET'], 10);
        let region = data['Nouvelle région'];
        let email = data['mail RGC'];

        let [codeRegion, nbAvis] = await Promise.all([
            findCodeRegionByName(region),
            db.collection('comment').countDocuments({ 'training.organisation.siret': data['SIRET'] })
        ]);

        return {
            _id: siret,
            SIRET: siret,
            raisonSociale: data['LIBELLE'],
            courriel: email,
            token: uuid.v4(),
            creationDate: new Date(),
            sources: ['kairos'],
            codeRegion,
            meta: {
                siretAsString: data['SIRET'],
                nbAvis,
                kairosData: {
                    libelle: data['LIBELLE'],
                    region: region,
                    nomRGC: data['Nom RGC'],
                    prenomRGC: data['Prénom RGC'],
                    emailRGC: email,
                    telephoneRGC: data['Téléphone RGC'],
                    assedic: data['ASSEDIC'],
                    convention: data['convention'],
                    dateDebut: moment.tz(data['date début'], 'DD/MM/YYYY', 'Europe/Paris').toDate(),
                    dateFin: moment.tz(data['date fin'], 'DD/MM/YYYY', 'Europe/Paris').toDate(),
                },
            }
        };
    };

    return {
        importAccounts: async file => {

            let collection = db.collection('organismes');
            let results = {
                total: 0,
                created: 0,
                updated: 0,
                invalid: 0,
            };

            await db.collection('departements').createIndex({ region: 'text' });

            return new Promise((resolve, reject) => {
                fs.createReadStream(file)
                .pipe(parse({
                    delimiter: '|',
                    quote: '',
                    columns: [
                        'SIRET',
                        'LIBELLE',
                        'REGION',
                        'Nouvelle région',
                        'Nom RGC',
                        'Prénom RGC',
                        'mail RGC',
                        'Téléphone RGC',
                        'ASSEDIC',
                        'convention',
                        'date début',
                        'date fin',
                    ],
                }))
                .pipe(handleBackPressure(async data => {
                    try {
                        let newAccount = await buildAccount(data);

                        let previous = await collection.findOne({ SIRET: newAccount.SIRET });
                        if (!previous) {
                            await collection.insertOne(newAccount);
                            return { status: 'created', account: newAccount };

                        } else {
                            await collection.updateOne({ SIRET: newAccount.SIRET }, {
                                $addToSet: {
                                    courrielsSecondaires: newAccount.meta.kairosData.emailRGC,
                                    sources: 'kairos'
                                },
                                $set: {
                                    ...(previous.courriel ? {} : { courriel: newAccount.courriel }),
                                    'updateDate': new Date(),
                                    'codeRegion': newAccount.codeRegion,
                                    'meta': newAccount.meta,
                                }
                            });

                            return { status: 'updated', account: newAccount };
                        }
                    } catch (e) {
                        return { status: 'invalid', account: data, error: e };
                    }
                }))
                .on('data', ({ account, status, error }) => {
                    results.total++;
                    results[status]++;

                    if (status === 'updated') {
                        logger.debug(`Account ${account.SIRET} updated`);
                    } else if (status === 'invalid') {
                        logger.error(`Account cannot be imported`, account, error);
                    } else {
                        logger.debug(`New Account created ${account.SIRET}`);
                    }
                })
                .on('finish', async () => {
                    return results.invalid === 0 ? resolve(results) : reject(results);
                });
            });

        }
    };
};
