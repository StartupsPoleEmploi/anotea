module.exports = async db => {

    let res = await db.collection('comment').removeMany({ 'training.place.postalCode': /^(?![0-9])/ });

    return res.result.n;
};

