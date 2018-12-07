const uuid = require('node-uuid');
const _ = require('lodash');
const regions = require('../../../components/regions');
const generateOrganismesResponsables = require('./generators/generateOrganismesResponsables');
const generateOrganismesFormateurs = require('./generators/generateOrganismesFormateurs');
const generateOrganismesKairos = require('./generators/generateOrganismesKairos');
const computeScore = require('./computeScore');

class AccountImporter {

    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    async _buildAccountFromIntercarif(organisme) {
        let { findCodeRegionByPostalCode } = regions(this.db);
        let adresse = organisme.lieux_de_formation ?
            organisme.lieux_de_formation.find(l => l.adresse.code_postal).adresse : organisme.adresse;
        let siret = organisme.siret;

        let [codeRegion, score, kairosData] = await Promise.all([
            findCodeRegionByPostalCode(adresse.code_postal),
            computeScore(this.db, siret),
            this.db.collection('kairos_organismes').findOne({ siret }),
        ]);

        let document = {
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

        if (kairosData) {
            return Object.assign(document, {
                kairosCourriel: kairosData.emailRGC,
                codeRegion: kairosData.codeRegion,
            });
        }
        return document;
    }

    async _buildAccountFromKairos(data) {

        let siretAsInt = parseInt(data.siret, 10);
        let [score] = await Promise.all([computeScore(this.db, data.siret)]);

        return {
            _id: siretAsInt,
            SIRET: siretAsInt,
            raisonSociale: data.libelle,
            courriel: data.emailRGC,
            courriels: [data.emailRGC],
            kairosCourriel: data.emailRGC,
            token: uuid.v4(),
            creationDate: new Date(),
            codeRegion: data.codeRegion,
            sources: ['kairos'],
            numero: null,
            lieux_de_formation: [],
            score: score,
            meta: {
                siretAsString: data.siret,
            }
        };
    }

    async _importIntercarifAccounts(sourceCollectionName, stats) {

        let cursor = this.db.collection(sourceCollectionName).find({
            siret: { $ne: '00000000000000' },
            courriel: { $ne: null }
        });

        while (await cursor.hasNext()) {
            const organisme = await cursor.next();
            try {
                let account = await this._buildAccountFromIntercarif(organisme);

                let results = await this.db.collection('organismes')
                .updateOne(
                    { _id: account._id },
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
                    { upsert: true }
                );

                if (results.result.nModified === 1) {
                    stats.updated++;
                } else {
                    stats.created++;
                }
                stats.total++;

            } catch (e) {
                stats.invalid++;
                this.logger.error(`Account cannot be imported from ${sourceCollectionName}`, JSON.stringify(organisme, null, 2), e);
            }
        }
    }

    async _importMissingKairosAccounts(stats) {

        let cursor = this.db.collection('kairos_organismes').find();

        while (await cursor.hasNext()) {
            const data = await cursor.next();
            try {
                let account = await this._buildAccountFromKairos(data);

                let count = await this.db.collection('organismes').countDocuments({ _id: account._id });
                if (count === 0) {
                    await this.db.collection('organismes').insertOne(account);
                    stats.created++;
                    stats.total++;
                }
            } catch (e) {
                stats.invalid++;
                this.logger.error(`Account cannot be imported from kairos`, JSON.stringify(data, null, 2), e);
            }
        }
    }

    async generateOrganismes(file) {
        this.logger.info('Generating organismes responsables from intercarif...');
        await generateOrganismesResponsables(this.db);

        this.logger.info('Generating organismes formateurs from intercarif...');
        await generateOrganismesFormateurs(this.db);

        this.logger.info('Generating organismes from kairos...');
        return generateOrganismesKairos(this.db, this.logger, file);
    }

    async importAccounts() {
        let stats = {
            total: 0,
            updated: 0,
            created: 0,
            invalid: 0,
        };

        await this._importIntercarifAccounts('intercarif_organismes_responsables', stats);
        await this._importIntercarifAccounts('intercarif_organismes_formateurs', stats);
        await this._importMissingKairosAccounts(stats);

        return stats;
    }
}

module.exports = AccountImporter;
