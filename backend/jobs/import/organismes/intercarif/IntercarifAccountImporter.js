const uuid = require('node-uuid');
const _ = require('lodash');
const regions = require('../../../../components/regions');
const generateOrganismesResponsables = require('./generateOrganismesResponsables');
const generateOrganismesFormateurs = require('./generateOrganismesFormateurs');

class IntercarifAccountImporter {

    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    async _buildAccount(organisme) {
        let { findCodeRegionByPostalCode } = regions(this.db);
        let adresse = organisme.lieux_de_formation ? organisme.lieux_de_formation[0].adresse : organisme.adresse;

        return {
            _id: parseInt(organisme.siret, 10),
            SIRET: parseInt(organisme.siret, 10),
            raisonSociale: organisme.raison_sociale,
            courriel: organisme.courriel,
            token: uuid.v4(),
            creationDate: new Date(),
            sources: ['intercarif'],
            codeRegion: await findCodeRegionByPostalCode(adresse.code_postal),
            numero: organisme.numero,
            lieux_de_formation: organisme.lieux_de_formation ? organisme.lieux_de_formation : [],
            score: organisme.score,
            meta: {
                siretAsString: organisme.siret,
            }
        };
    }

    _createNewAccount(account) {
        return this.db.collection('organismes').insertOne(account);
    }

    _updateAccount(previous, newAccount) {
        return this.db.collection('organismes').updateOne({ _id: previous._id }, {
            $addToSet: {
                courrielsSecondaires: newAccount.courriel,
                sources: 'intercarif'
            },
            $set: {
                ...(previous.courriel ? {} : { courriel: newAccount.courriel }),
                'updateDate': new Date(),
            },
        });
    }

    async _synchronizeAccounts(sourceCollectionName, stats) {
        let cursor = this.db.collection(sourceCollectionName).find({
            siret: { $ne: '00000000000000' },
            courriel: { $ne: null }
        });

        while (await cursor.hasNext()) {
            const organisme = await cursor.next();
            try {
                let newAccount = await this._buildAccount(organisme);
                let previous = await this.db.collection('organismes').findOne({ _id: newAccount._id });
                stats.total++;

                if (!previous) {
                    stats.created++;
                    await this._createNewAccount(newAccount);
                    this.logger.debug(`New account ${newAccount.SIRET} created`);
                } else {
                    stats.updated++;
                    await this._updateAccount(previous, newAccount);
                    this.logger.debug(`Account ${newAccount.SIRET} updated`);
                }
            } catch (e) {
                stats.invalid++;
                this.logger.error(`Account cannot be imported from ${sourceCollectionName}`, organisme, e);
            }
        }
    }

    async generateOrganismes() {
        this.logger.info('Generating organismes responsables collection...');
        await generateOrganismesResponsables(this.db);

        this.logger.info('Generating organismes formateurs collection...');
        return generateOrganismesFormateurs(this.db);
    }

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

        await this._synchronizeAccounts('intercarif_organismes_responsables', stats.organismes_responsables);
        await this._synchronizeAccounts('intercarif_organismes_formateurs', stats.organismes_formateurs);

        return stats;
    }
}

module.exports = IntercarifAccountImporter;
