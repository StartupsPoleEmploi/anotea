const fs = require('fs');
const _ = require('lodash');
const parse = require('csv-parse');
const uuid = require('node-uuid');
const { handleBackPressure } = require('../../../job-utils');
const regions = require('../../../../components/regions');
const computeScore = require('../computeScore');

class KairosAccountImporter {

    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    async _buildAccount(data) {
        const { findCodeRegionByName } = regions(this.db);
        const siret = parseInt(data['SIRET'], 10);
        let region = data['Nouvelle région'];
        let email = data['mail RGC'];

        let [codeRegion, score] = await Promise.all([
            findCodeRegionByName(region),
            computeScore(this.db, data['SIRET']),
        ]);

        return {
            _id: siret,
            SIRET: siret,
            raisonSociale: data['LIBELLE'],
            courriel: email,
            kairosCourriel: email,
            token: uuid.v4(),
            creationDate: new Date(),
            codeRegion: codeRegion,
            sources: ['kairos'],
            score: score,
            meta: {
                siretAsString: data['SIRET'],
            }
        };
    }

    _updateAccount(account) {
        return this.db.collection('organismes').updateOne({ _id: account._id },
            {
                $setOnInsert: _.omit(account, ['sources', 'score', 'codeRegion', 'kairosCourriel']),
                $addToSet: {
                    sources: 'kairos',
                    courriels: account.courriel,
                },
                $set: {
                    updateDate: new Date(),
                    ..._.pick(account, ['score', 'codeRegion', 'kairosCourriel'])
                },
            },
            { upsert: true });
    }

    async importAccounts(file) {
        let results = {
            total: 0,
            created: 0,
            updated: 0,
            invalid: 0,
        };

        await this.db.collection('departements').createIndex({ region: 'text' });

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
                    let newAccount = await this._buildAccount(data);

                    let results = await this._updateAccount(newAccount);

                    if (results.nModified > 0) {
                        return { status: 'created', account: newAccount };
                    } else {
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
                    this.logger.debug(`Account ${account.SIRET} updated`);
                } else if (status === 'invalid') {
                    this.logger.error(`Account cannot be imported`, account, error);
                } else {
                    this.logger.debug(`New Account created ${account.SIRET}`);
                }
            })
            .on('finish', async () => {
                return results.invalid === 0 ? resolve(results) : reject(results);
            });
        });

    }
}

module.exports = KairosAccountImporter;
