const NotesDTO = require('./NotesDTO');

class ScoreDTO {

    constructor(data) {
        Object.assign(this, data);
    }

    toJSON() {
        let { notes, nb_avis: nbAvis } = this;
        return {
            nb_avis: nbAvis,
            notes: notes && new NotesDTO(notes),
        };
    }
}

module.exports = ScoreDTO;
