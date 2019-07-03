const generateOrganismesResponsables = require('./intercarif/generateOrganismesResponsables');
const generateOrganismesFormateurs = require('./intercarif/generateOrganismesFormateurs');

module.exports = async (db, logger) => {
    logger.debug('Generating organismes responsables from intercarif...');
    let responsable = await generateOrganismesResponsables(db);

    logger.debug('Generating organismes formateurs from intercarif...');
    let formateurs = await generateOrganismesFormateurs(db);

    return { responsable, formateurs };
};
