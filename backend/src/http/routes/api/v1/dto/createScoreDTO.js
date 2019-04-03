const createNoteDTO = require('./createNoteDTO');

module.exports = score => {
    return {
        nb_avis: score.nb_avis,
        notes: score.notes && createNoteDTO(score.notes),
    };
};
