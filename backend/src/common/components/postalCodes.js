module.exports = db => {
    return {
        findINSEECodeByINSEE: async insee => await db.collection('inseeCode').findOne({ insee: insee })
    };
};
