module.exports = {
    asOrganization: organisme => {

        let getAggregateRating = () => {
            return {
                '@type': 'AggregateRating',
                'ratingValue': organisme.score.notes.global,
                'ratingCount': organisme.score.nb_avis,
                'bestRating': organisme.score.aggregation.global.max,
                'worstRating': organisme.score.aggregation.global.min,
            };
        };

        return {
            //See https://schema.org/Organization for more information
            '@context': 'http://schema.org',
            '@type': 'Organization',
            'name': organisme.raisonSociale,
            ...(organisme.score && organisme.score.nb_avis > 0 ? { 'aggregateRating': getAggregateRating() } : {}),
        };
    },
};
