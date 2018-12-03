module.exports = comment => {
    // let email = (organisme.meta && organisme.meta.kairosData) ? organisme.meta.kairosData.emailRGC : organisme.courriel;
    return comment.trainee.email;
};