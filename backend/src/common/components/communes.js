module.exports = db => {
    return {
        findCommuneByPostalCode: postalCode => db.collection('communes').findOne({ postalCodes: postalCode }),
    };
};
