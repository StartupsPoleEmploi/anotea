const uuid = require('node-uuid');
const regions = require('../../../../components/regions');

class IntercarifAccountImporter {

    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    async _buildAccount(type, organisme) {
        let { findCodeRegionByPostalCode } = regions(this.db);
        let codePostal = type === 'formateur' ? organisme.lieux_de_formation[0].adresse.code_postal :
            organisme.adresse.code_postal;

        let [codeRegion, nbAvis] = await Promise.all([
            findCodeRegionByPostalCode(codePostal),
            this.db.collection('comment').countDocuments({ 'training.organisation.siret': organisme.siret })
        ]);

        return {
            _id: parseInt(organisme.siret, 10),
            SIRET: parseInt(organisme.siret, 10),
            raisonSociale: organisme.raison_sociale,
            courriel: organisme.courriel,
            token: uuid.v4(),
            creationDate: new Date(),
            sources: ['intercarif'],
            codeRegion,
            meta: {
                siretAsString: organisme.siret,
                nbAvis
            }
        };
    }

    async _createAccountsFromOrganismes(source, type, stats) {
        let collection = this.db.collection('organismes');
        let cursor = this.db.collection(source).find({
            siret: { $ne: '00000000000000' },
            courriel: { $ne: null }
        });

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            try {
                let newAccount = await this._buildAccount(type, doc);
                let previous = await collection.findOne({ _id: newAccount._id });
                stats[source].total++;

                if (!previous) {
                    stats[source].created++;
                    await collection.insertOne(newAccount);
                    this.logger.debug(`New account ${newAccount.SIRET} created`);
                } else {
                    stats[source].updated++;
                    await collection.updateOne({ _id: previous._id }, {
                        $addToSet: {
                            courrielsSecondaires: newAccount.courriel,
                            sources: 'intercarif'
                        },
                        $set: {
                            ...(previous.courriel ? {} : { courriel: newAccount.courriel }),
                            'updateDate': new Date(),
                            'codeRegion': newAccount.codeRegion,
                            'meta': newAccount.meta,
                        },
                    });
                    this.logger.debug(`Account ${newAccount.SIRET} updated`);
                }
            } catch (e) {
                stats[source].invalid++;
                this.logger.error(`Account cannot be imported from ${source}`, doc, e);
            }
        }
    };

    async importAccounts() {
        let stats = {
            organismes_responsables: {
                total: 0,
                updated: 0,
                created: 0,
                invalid: 0,
            },
            organismes_formateurs: {
                total: 0,
                updated: 0,
                created: 0,
                invalid: 0,
            },
        };

        await this._createAccountsFromOrganismes('organismes_responsables', 'responsable', stats);
        await this._createAccountsFromOrganismes('organismes_formateurs', 'formateur', stats);

        return stats;
    }
}

module.exports = IntercarifAccountImporter;
