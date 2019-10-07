module.exports = async db => {
    return Promise.all([
        db.collection('trainee').updateMany({}, {
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
                'training.idSessionAudeFormation': 1,
            }
        }),
        db.collection('comment').updateMany({}, {
            $unset: {
                'idSession': 1,
                'formacode': 1,
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
                'training.idSessionAudeFormation': 1,
            }
        })
    ]);
};
