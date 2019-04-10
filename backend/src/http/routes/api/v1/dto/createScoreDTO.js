const createNoteDTO = require('./createNoteDTO');

module.exports = (data, options) => {
    return {
        nb_avis: data.nb_avis,
        notes: data.notes && createNoteDTO(data.notes, options),
    };
};
