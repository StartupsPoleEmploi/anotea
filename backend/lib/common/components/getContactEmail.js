module.exports = organisme => {
    return organisme.editedCourriel || organisme.kairosCourriel || organisme.courriel;
};
