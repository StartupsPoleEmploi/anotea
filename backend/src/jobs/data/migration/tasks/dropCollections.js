module.exports = db => {

    return Promise.all([
        db.collection('intercarif_organismes_responsables').drop().catch(() => ({})),
        db.collection('intercarif_organismes_formateurs').drop().catch(() => ({})),
        db.collection('kairos_organismes').drop().catch(() => ({})),
        db.collection('tmp.agg_out.36').drop().catch(() => ({})),
        db.collection('tmp.agg_out.37').drop().catch(() => ({})),
        db.collection('tmp.agg_out.38').drop().catch(() => ({})),
        db.collection('tmp.agg_out.39').drop().catch(() => ({})),
        db.collection('tmp.agg_out.40').drop().catch(() => ({})),
        db.collection('tmp.agg_out.41').drop().catch(() => ({})),
        db.collection('tmp.agg_out.42').drop().catch(() => ({})),
        db.collection('tmp.agg_out.43').drop().catch(() => ({})),
        db.collection('tmp.agg_out.44').drop().catch(() => ({})),
        db.collection('tmp.agg_out.45').drop().catch(() => ({})),
        db.collection('tmp.agg_out.46').drop().catch(() => ({})),
        db.collection('tmp.agg_out.47').drop().catch(() => ({})),
        db.collection('tmp.agg_out.48').drop().catch(() => ({})),
        db.collection('tmp.agg_out.49').drop().catch(() => ({})),
        db.collection('tmp.agg_out.50').drop().catch(() => ({})),
        db.collection('tmp.agg_out.51').drop().catch(() => ({})),
        db.collection('tmp.agg_out.52').drop().catch(() => ({})),
        db.collection('tmp.agg_out.53').drop().catch(() => ({})),
    ]);
};
