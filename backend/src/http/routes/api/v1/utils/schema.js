let getAggregateRating = score => {
    return {
        '@type': 'AggregateRating',
        'ratingValue': score.notes.global,
        'ratingCount': score.nb_avis,
        'bestRating': score.aggregation.global.max,
        'worstRating': score.aggregation.global.min,
    };
};

let getOrganization = organisme => {
    return {
        '@type': 'Organization',
        'name': organisme.raisonSociale || organisme.raison_sociale, //FIXME
    };
};

let getCourse = formation => {

    return {
        '@type': 'Course',
        'courseCode': formation.numero,
        'name': formation.intitule,
        'provider': getOrganization(formation.organisme_responsable),
    };
};

module.exports = {
    toOrganization: organisme => {
        let hasScore = organisme.score && organisme.score.nb_avis > 0;

        return {
            '@context': 'http://schema.org',
            ...getOrganization(organisme),
            ...(hasScore ? { 'aggregateRating': getAggregateRating(organisme.score) } : {}),
        };
    },
    toCourse: formation => {
        let hasScore = formation.score && formation.score.nb_avis > 0;

        return {
            '@context': 'http://schema.org',
            ...getCourse(formation),
            ...(hasScore ? { 'aggregateRating': getAggregateRating(formation.score) } : {}),
        };
    },
    toCourseInstance: action => {

        let hasScore = action.score && action.score.nb_avis > 0;
        return {
            '@context': 'http://schema.org',
            ...getCourse(action.formation),
            ...(hasScore ? { 'aggregateRating': getAggregateRating(action.score) } : {}),
        };
    },
};
