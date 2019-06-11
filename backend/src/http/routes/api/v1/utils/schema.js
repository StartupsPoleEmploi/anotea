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
    toCourse: (formation, options = {}) => {
        let score = options.score || formation.score;
        let hasScore = score && score.nb_avis > 0;

        return {
            '@context': 'http://schema.org',
            ...getCourse(formation),
            ...(hasScore ? { 'aggregateRating': getAggregateRating(score) } : {}),
        };
    },
    toCourseInstance: session => {

        let hasScore = session.score && session.score.nb_avis > 0;
        return {
            '@context': 'http://schema.org',
            ...getCourse(session.formation),
            'hasCourseInstance': [
                {
                    '@type': 'CourseInstance',
                    'name': session.formation.intitule,
                    'courseMode': 'onsite',
                    'location': {
                        '@type': 'Place',
                        'name': session.formation.action.lieu_de_formation.ville,
                        'address': {
                            '@type': 'PostalAddress',
                            'addressLocality': session.formation.action.lieu_de_formation.ville,
                            'postalCode': session.formation.action.lieu_de_formation.code_postal,
                        },
                    },
                    'organizer': getOrganization(session.formation.action.organisme_formateur),
                    'performer': getOrganization(session.formation.action.organisme_formateur),
                    'startDate': session.periode.debut,
                    'endDate': session.periode.fin,
                }
            ],
            ...(hasScore ? { 'aggregateRating': getAggregateRating(session.score) } : {}),
        };
    },
};
