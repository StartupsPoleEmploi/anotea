module.exports = organisme => {
    let email = (organisme.meta && organisme.meta.kairosData) ? organisme.meta.kairosData.emailRGC : organisme.courriel;
    return organisme.editedCourriel ? organisme.editedCourriel : email;
};
