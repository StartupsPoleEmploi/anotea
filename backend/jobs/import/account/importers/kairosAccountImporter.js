const fs = require('fs');
const parse = require('csv-parse');
const uuid = require('node-uuid');
const moment = require('moment');
const { handleBackPressure } = require('../../../utils');

module.exports = (db, logger) => {

    const { findCodeRegionByName } = require('../../../../components/regions')(db);

    const buildAccount = async data => {
        const siret = parseInt(data['SIRET'], 10);
        let region = data['Nouvelle région'];
        let email = data['mail RGC'];

        return {
            _id: siret,
            SIRET: siret,
            raisonSociale: data['LIBELLE'],
            courriel: email,
            token: uuid.v4(),
            creationDate: new Date(),
            sources: ['kairos'],
            codeRegion: await findCodeRegionByName(region),
            meta: {
                siretAsString: data['SIRET'],
                kairosData: {
                    libelle: data['LIBELLE'],
                    region: region,
                    nomRGC: data['Nom RGC'],
                    prenomRGC: data['Prénom RGC'],
                    emailRGC: email,
                    telephoneRGC: data['Téléphone RGC'],
                    convention: data['convention'],
                    dateDebut: moment(data['date début'], 'DD/MM/YYYY').toDate(),
                    dateFin: moment(data['date fin'], 'DD/MM/YYYY').toDate(),
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

            await db.collection('regions').createIndex({ region: 'text' });

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
                            await collection.insert(newAccount);
                            return { status: 'created', account: newAccount };

                        } else {
                            await collection.update({ SIRET: newAccount.SIRET }, {
                                $addToSet: {
                                    courrielsSecondaires: newAccount.meta.kairosData.emailRGC,
                                    sources: 'kairos'
                                },
                                $set: {
                                    ...(previous.courriel ? {} : { courriel: newAccount.courriel }),
                                    'meta.kairosData': newAccount.meta.kairosData,
                                    'updateDate': new Date(),
                                    'codeRegion': newAccount.codeRegion,
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
