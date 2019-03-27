module.exports = async (db, collectionName) => {
    //TODO wait for $round in Mongo 4.2
    let promises = [];
    let cursor = db.collection(collectionName).find({ 'score.notes': { $exists: true } });
    while (await cursor.hasNext()) {
        const document = await cursor.next();
        let notes = document.score.notes;
        promises.push(db.collection(collectionName).updateOne({ _id: document._id }, {
            $set: {
                'score.notes': {
                    accueil: Math.round(notes.accueil),
                    contenu_formation: Math.round(notes.contenu_formation),
                    equipe_formateurs: Math.round(notes.equipe_formateurs),
                    moyen_materiel: Math.round(notes.moyen_materiel),
                    accompagnement: Math.round(notes.accompagnement),
                    global: Math.round(notes.global)
                },
            },

        }));
    }
    return Promise.all(promises);
};
