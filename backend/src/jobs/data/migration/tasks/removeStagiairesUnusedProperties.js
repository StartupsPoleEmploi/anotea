module.exports = async db => {
    return db.collection('trainee').updateMany({}, {
        $unset: {
            'trainee.dnIndividuNational': 1,
            'training.origineSession': 1,
            'training.aesRecu': 1,
            'training.referencement': 1,
            'training.niveauEntree': 1,
            'training.niveauSortie': 1,
            'training.dureeHebdo': 1,
            'training.dureeMaxi': 1,
            'training.dureeEntreprise': 1,
            'training.dureeIndicative': 1,
            'training.nombreHeuresCentre': 1,
        }
    });
};
