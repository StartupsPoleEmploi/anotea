module.exports = db => {

    return Promise.all([
        db.dropCollection('intercarif_organismes_responsables'),
        db.dropCollection('intercarif_organismes_formateurs'),
        db.dropCollection('kairos_organismes'),
        db.dropCollection('tmp.agg_out.36'),
        db.dropCollection('tmp.agg_out.37'),
        db.dropCollection('tmp.agg_out.38'),
        db.dropCollection('tmp.agg_out.39'),
        db.dropCollection('tmp.agg_out.40'),
        db.dropCollection('tmp.agg_out.41'),
        db.dropCollection('tmp.agg_out.42'),
        db.dropCollection('tmp.agg_out.43'),
        db.dropCollection('tmp.agg_out.44'),
        db.dropCollection('tmp.agg_out.45'),
        db.dropCollection('tmp.agg_out.46'),
        db.dropCollection('tmp.agg_out.47'),
        db.dropCollection('tmp.agg_out.48'),
        db.dropCollection('tmp.agg_out.49'),
        db.dropCollection('tmp.agg_out.50'),
        db.dropCollection('tmp.agg_out.51'),
        db.dropCollection('tmp.agg_out.52'),
        db.dropCollection('tmp.agg_out.52'),
        db.dropCollection('contact-stagiaires'),
    ]);
};
