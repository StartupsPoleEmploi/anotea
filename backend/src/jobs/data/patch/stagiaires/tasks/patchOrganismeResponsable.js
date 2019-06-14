module.exports = async (db, logger) => {

    let stats = {
        updated: 0,
        invalid: 0,
        total: 0,
    };

    let responsables = await db.collection('intercarif_organismes_responsables').find();
    while (await responsables.hasNext()) {
        let responsable = await responsables.next();
        let codePostaux = responsable.organisme_formateurs.reduce((acc, organisme) => {
            return [
                ...acc,
                ...organisme.lieux_de_formation.map(l => l.adresse.code_postal),
            ];
        }, []);

        try {
            let trainees = await db.collection('trainee').find({
                'training.organisation.siret': responsable.siret,
                'training.place.postalCode': { $in: codePostaux },
                'meta.patch.siret': { $exists: false },
            });

            while (await trainees.hasNext()) {
                stats.total++;
                let trainee = await trainees.next();
                let siret = trainee.training.organisation.siret;
                let codePostal = trainee.training.place.postalCode;
                let formateurs = responsable.organisme_formateurs.filter(o => {
                    return o.lieux_de_formation.find(lieu => lieu.adresse.code_postal === codePostal);
                });

                if (formateurs.length === 1 && formateurs[0].siret !== responsable.siret) {
                    let token = trainee.token;
                    await Promise.all([
                        db.collection('trainee').updateOne(
                            { token: token },
                            {
                                $set: {
                                    'training.organisation.siret': formateurs[0].siret,
                                    'meta.patch.siret': siret,
                                },
                            },
                            { upsert: false }
                        ),
                        //TODO remove me
                        db.collection('comment').updateOne(
                            { token: token },
                            {
                                $set: {
                                    'training.organisation.siret': formateurs[0].siret,
                                    'meta.patch.siret': siret,
                                },
                            },
                            { upsert: false }
                        )
                    ]);

                    stats.updated++;
                }
            }
        } catch (e) {
            stats.invalid++;
            logger.error(`Stagiaire cannot be patched`, e);
        }
    }

    return stats;
};

