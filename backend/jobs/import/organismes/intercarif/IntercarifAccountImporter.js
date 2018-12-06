const uuid = require('node-uuid');
const _ = require('lodash');
const regions = require('../../../../components/regions');
const generateOrganismesResponsables = require('./generateOrganismesResponsables');
const generateOrganismesFormateurs = require('./generateOrganismesFormateurs');
const computeScore = require('../computeScore');

class IntercarifAccountImporter {

    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    async _buildAccount(organisme) {
        let { findCodeRegionByPostalCode } = regions(this.db);
        let adresse = organisme.lieux_de_formation ? organisme.lieux_de_formation[0].adresse : organisme.adresse;
        let siret = organisme.siret;

        let [codeRegion, score] = await Promise.all([
            findCodeRegionByPostalCode(adresse.code_postal),
            computeScore(this.db, siret),
        ]);

        return {
            _id: parseInt(siret, 10),
            SIRET: parseInt(siret, 10),
            raisonSociale: organisme.raison_sociale,
            courriel: organisme.courriel,
            token: uuid.v4(),
            creationDate: new Date(),
            codeRegion: codeRegion,
            sources: ['intercarif'],
            numero: organisme.numero,
            lieux_de_formation: organisme.lieux_de_formation ? organisme.lieux_de_formation : [],
            score: score,
            meta: {
                siretAsString: siret,
            }
        };
    }

    _updateAccount(account) {
        return this.db.collection('organismes').updateOne({ _id: account._id },
            {
                $setOnInsert: _.omit(account, ['sources', 'numero', 'lieux_de_formation', 'score']),
                $addToSet: {
                    sources: 'intercarif',
                    courriels: account.courriel,
                },
                $set: {
                    updateDate: new Date(),
                    ..._.pick(account, ['numero', 'lieux_de_formation', 'score'])
                },
            },
            { upsert: true });
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

                let results = await this._updateAccount(newAccount);

                if (results.nModified > 0) {
                    stats.updated++;
                } else {
                    stats.created++;
                }
                stats.total++;

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
