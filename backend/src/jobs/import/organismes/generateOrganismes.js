const generateOrganismesResponsables = require('./generators/generateOrganismesResponsables');
const generateOrganismesFormateurs = require('./generators/generateOrganismesFormateurs');
const generateOrganismesKairos = require('./generators/generateOrganismesKairos');

module.exports = async (db, logger, file) => {
    logger.debug('Generating organismes responsables from intercarif...');
    let responsable = await generateOrganismesResponsables(db);

    logger.debug('Generating organismes formateurs from intercarif...');
    let formateurs = await generateOrganismesFormateurs(db);

    logger.debug('Generating organismes from kairos...');
    let kairos = await generateOrganismesKairos(db, logger, file);

    return { intercarif: { responsable, formateurs }, kairos };
};
