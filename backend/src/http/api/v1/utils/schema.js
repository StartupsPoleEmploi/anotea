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
        'name': organisme.raison_sociale,
    };
};

let getCourse = formation => {
    return {
        '@type': 'Course',
        'courseCode': formation.numero,
        'name': formation.intitule,
        'description': formation.objectif_formation,
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
    toCourse: doc => {
        let formation = doc.formation || doc;
        let score = doc.score;
        let hasScore = score && score.nb_avis > 0;

        return {
            '@context': 'http://schema.org',
            ...getCourse(formation),
            ...(hasScore ? { 'aggregateRating': getAggregateRating(score) } : {}),
            ...(doc.periode ? {
                'hasCourseInstance': [
                    {
                        '@type': 'CourseInstance',
                        'name': formation.intitule,
                        'courseMode': 'onsite',
                        'location': {
                            '@type': 'Place',
                            'name': formation.action.lieu_de_formation.ville,
                            'address': {
                                '@type': 'PostalAddress',
                                'addressLocality': formation.action.lieu_de_formation.ville,
                                'postalCode': formation.action.lieu_de_formation.code_postal,
                            },
                        },
                        'organizer': getOrganization(formation.action.organisme_formateur),
                        'performer': getOrganization(formation.action.organisme_formateur),
                        'startDate': doc.periode.debut,
                        'endDate': doc.periode.fin,
                    }
                ]
            } : {}),
        };
    },
};
