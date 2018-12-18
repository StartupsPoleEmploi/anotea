let assert = require('assert');

let dataExposer = require('../../lib/http/routes/dataExposer')();

describe('DataExposer (API)', function() {

    // todo à mettre dans les tests
    let inputObjectFull = {
        '_id': '5925931dfe18fa2a979fa0f2',
        'token': '6990eada10c1d97c737dc784e15c322aa0849493e9cc574bd6f14126b3c5cb4c',
        'campaign': 'Campagne01-12.05.17',
        'formacode': '15041',
        'idSession': '2692665',
        'training': {
            'idFormation': '14_AF_0000022464',
            'title': 'Parcours 2 : remise à niveau en lien avec un projet professionnel validé',
            'startDate': new Date('2015-12-31T23:00:00Z'),
            'scheduledEndDate': new Date('2016-12-30T23:00:00Z'),
            'organisation': {
                'id': '14000000000000000793',
                'siret': '19750688400026',
                'label': 'GRETA M2S',
                'name': 'LYCEE GENERAL ET TECHNOLOGIQUE RABELAIS PARAMEDICAL ET SOCIAL - GRETA DES METIERS DE LA SANTE ET DU SOCIAL'
            },
            'place': { 'postalCode': '75012', 'city': 'Paris' },
            'certifInfo': {
                'id': '84482',
                'label': 'CléA (socle de connaissances et de compétences professionnelles)'
            },
            'idSession': '2692665',
            'formacode': '15041',
            'aesRecu': 'AES',
            'referencement': '41N562441449',
            'idSessionAudeFormation': '2692665',
            'infoCarif': { 'numeroAction': '14_SE_0000064397', 'numeroSession': 'SE_0000064397' },
            'codeFinanceur': '2'
        },
        'step': 3,
        'rates': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudo': 'patrick',
        'comment': { 'title': 'super', 'text': 'chouette' },
        'date': new Date('2017-05-24T14:05:32.094Z'),
        'accord': false
    };
    let expectedObjectFull = {
        'id': '5925931dfe18fa2a979fa0f2',
        'date': new Date(2017, 4, 24, 16, 5, 32, 94),
        'dateDebutFormation': new Date(2016, 0, 1),
        'dateFinFormation': new Date(2016, 11, 31),
        'formacode': '15041',
        'id_formation': '14_AF_0000022464',
        'id_of': '14000000000000000793',
        'notes': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudonyme': 'patrick',
        'commentaire': { 'titre': 'super', 'contenu': 'chouette' },
        'reponseOF': null
    };

    let inputObjectWithoutTitle = {
        '_id': '5925931dfe18fa2a979fa0f2',
        'token': '6990eada10c1d97c737dc784e15c322aa0849493e9cc574bd6f14126b3c5cb4c',
        'campaign': 'Campagne01-12.05.17',
        'formacode': '15041',
        'idSession': '2692665',
        'training': {
            'idFormation': '14_AF_0000022464',
            'title': 'Parcours 2 : remise à niveau en lien avec un projet professionnel validé',
            'startDate': new Date('2015-12-31T23:00:00Z'),
            'scheduledEndDate': new Date('2016-12-30T23:00:00Z'),
            'organisation': {
                'id': '14000000000000000793',
                'siret': '19750688400026',
                'label': 'GRETA M2S',
                'name': 'LYCEE GENERAL ET TECHNOLOGIQUE RABELAIS PARAMEDICAL ET SOCIAL - GRETA DES METIERS DE LA SANTE ET DU SOCIAL'
            },
            'place': { 'postalCode': '75012', 'city': 'Paris' },
            'certifInfo': {
                'id': '84482',
                'label': 'CléA (socle de connaissances et de compétences professionnelles)'
            },
            'idSession': '2692665',
            'formacode': '15041',
            'aesRecu': 'AES',
            'referencement': '41N562441449',
            'idSessionAudeFormation': '2692665',
            'infoCarif': { 'numeroAction': '14_SE_0000064397', 'numeroSession': 'SE_0000064397' },
            'codeFinanceur': '2'
        },
        'step': 3,
        'rates': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudo': 'patrick',
        'comment': { 'text': 'chouette' },
        'date': new Date('2017-05-24T14:05:32.094Z'),
        'accord': false
    };
    let expectedObjectWithoutTitle = {
        'id': '5925931dfe18fa2a979fa0f2',
        'date': new Date(2017, 4, 24, 16, 5, 32, 94),
        'dateDebutFormation': new Date(2016, 0, 1),
        'dateFinFormation': new Date(2016, 11, 31),
        'formacode': '15041',
        'id_formation': '14_AF_0000022464',
        'id_of': '14000000000000000793',
        'notes': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudonyme': 'patrick',
        'commentaire': { 'titre': null, 'contenu': 'chouette' },
        'reponseOF': null
    };

    let inputObjectWithoutText = {
        '_id': '5925931dfe18fa2a979fa0f2',
        'token': '6990eada10c1d97c737dc784e15c322aa0849493e9cc574bd6f14126b3c5cb4c',
        'campaign': 'Campagne01-12.05.17',
        'formacode': '15041',
        'idSession': '2692665',
        'training': {
            'idFormation': '14_AF_0000022464',
            'title': 'Parcours 2 : remise à niveau en lien avec un projet professionnel validé',
            'startDate': new Date('2015-12-31T23:00:00Z'),
            'scheduledEndDate': new Date('2016-12-30T23:00:00Z'),
            'organisation': {
                'id': '14000000000000000793',
                'siret': '19750688400026',
                'label': 'GRETA M2S',
                'name': 'LYCEE GENERAL ET TECHNOLOGIQUE RABELAIS PARAMEDICAL ET SOCIAL - GRETA DES METIERS DE LA SANTE ET DU SOCIAL'
            },
            'place': { 'postalCode': '75012', 'city': 'Paris' },
            'certifInfo': {
                'id': '84482',
                'label': 'CléA (socle de connaissances et de compétences professionnelles)'
            },
            'idSession': '2692665',
            'formacode': '15041',
            'aesRecu': 'AES',
            'referencement': '41N562441449',
            'idSessionAudeFormation': '2692665',
            'infoCarif': { 'numeroAction': '14_SE_0000064397', 'numeroSession': 'SE_0000064397' },
            'codeFinanceur': '2'
        },
        'step': 3,
        'rates': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudo': 'patrick',
        'comment': { 'title': 'super' },
        'date': new Date('2017-05-24T14:05:32.094Z'),
        'accord': false
    };
    let expectedObjectWithoutText = {
        'id': '5925931dfe18fa2a979fa0f2',
        'date': new Date(2017, 4, 24, 16, 5, 32, 94),
        'dateDebutFormation': new Date(2016, 0, 1),
        'dateFinFormation': new Date(2016, 11, 31),
        'formacode': '15041',
        'id_formation': '14_AF_0000022464',
        'id_of': '14000000000000000793',
        'notes': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudonyme': 'patrick',
        'commentaire': { 'titre': 'super', 'contenu': null },
        'reponseOF': null
    };

    let inputObjectEmpty = {
        '_id': '5925931dfe18fa2a979fa0f2',
        'token': '6990eada10c1d97c737dc784e15c322aa0849493e9cc574bd6f14126b3c5cb4c',
        'campaign': 'Campagne01-12.05.17',
        'formacode': '15041',
        'idSession': '2692665',
        'training': {
            'idFormation': '14_AF_0000022464',
            'title': 'Parcours 2 : remise à niveau en lien avec un projet professionnel validé',
            'startDate': new Date('2015-12-31T23:00:00Z'),
            'scheduledEndDate': new Date('2016-12-30T23:00:00Z'),
            'organisation': {
                'id': '14000000000000000793',
                'siret': '19750688400026',
                'label': 'GRETA M2S',
                'name': 'LYCEE GENERAL ET TECHNOLOGIQUE RABELAIS PARAMEDICAL ET SOCIAL - GRETA DES METIERS DE LA SANTE ET DU SOCIAL'
            },
            'place': { 'postalCode': '75012', 'city': 'Paris' },
            'certifInfo': {
                'id': '84482',
                'label': 'CléA (socle de connaissances et de compétences professionnelles)'
            },
            'idSession': '2692665',
            'formacode': '15041',
            'aesRecu': 'AES',
            'referencement': '41N562441449',
            'idSessionAudeFormation': '2692665',
            'infoCarif': { 'numeroAction': '14_SE_0000064397', 'numeroSession': 'SE_0000064397' },
            'codeFinanceur': '2'
        },
        'step': 3,
        'rates': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudo': 'patrick',
        'date': new Date('2017-05-24T14:05:32.094Z'),
        'accord': false
    };
    let expectedObjectEmpty = {
        'id': '5925931dfe18fa2a979fa0f2',
        'date': new Date(2017, 4, 24, 16, 5, 32, 94),
        'dateDebutFormation': new Date(2016, 0, 1),
        'dateFinFormation': new Date(2016, 11, 31),
        'formacode': '15041',
        'id_formation': '14_AF_0000022464',
        'id_of': '14000000000000000793',
        'notes': {
            'accueil': 3,
            'contenu_formation': 2,
            'equipe_formateurs': 2,
            'moyen_materiel': 3,
            'accompagnement': 2,
            'global': 3
        },
        'pseudonyme': 'patrick',
        'commentaire': null,
        'reponseOF': null
    };

    describe.skip('buildAdvice', function() {
        it('should build a well formed object with a valid input, fully fullfilled', function() {
            let builtObject = dataExposer.buildAdvice(inputObjectFull);
            assert.deepEqual(builtObject, expectedObjectFull);
        });

        it('should build a well formed object with a valid input, with title not fullfilled', function() {
            let builtObject = dataExposer.buildAdvice(inputObjectFull);
            assert.deepEqual(builtObject, expectedObjectFull);
        });

        it('should build a well formed object with a valid input, with text not fullfilled', function() {
            let builtObject = dataExposer.buildAdvice(inputObjectWithoutText);
            assert.deepEqual(builtObject, expectedObjectWithoutText);
        });

        it('should build a well formed object with a valid input, with title and text not fullfilled', function() {
            let builtObject = dataExposer.buildAdvice(inputObjectEmpty);
            assert.deepEqual(builtObject, expectedObjectEmpty);
        });
    });


    let inputObjectFullBuildCommentsStats = {
        '_id': 'Campagne01-12.05.17',
        'date': '2017-06-07T13:40:50.132Z',
        'mailSent': 9,
        'mailOpen': 0,
        'linkClick': 0,
        'pageOne': 0,
        'formValidated': 3,
        'allowToContact': 1,
        'commentsArray': [{ 'title': 'ff', 'text': 'fff' }, { 'title': 'super', 'text': 'chouette' }, {
            'title': 'ff',
            'text': 'fff'
        }, { 'title': 'ff', 'text': '' }, { 'title': '', 'text': 'fff' }, null],
        'commentsRejectedArray': [{ pseudo: true, comment: false, commentTitle: true }]
    };
    let expectedObjectFullBuildCommentsStats = {
        '_id': 'Campagne01-12.05.17',
        'date': '2017-06-07T13:40:50.132Z',
        'mailSent': 9,
        'mailOpen': 0,
        'linkClick': 0,
        'pageOne': 0,
        'formValidated': 3,
        'allowToContact': 1,
        'comments': 5,
        'commentsRejected': 1
    };

    let inputEmptyRejectedBuildCommentsStats = {
        '_id': 'Campagne01-12.05.17',
        'date': '2017-06-07T13:40:50.132Z',
        'mailSent': 9,
        'mailOpen': 0,
        'linkClick': 0,
        'pageOne': 0,
        'formValidated': 3,
        'allowToContact': 1,
        'commentsArray': [{ 'title': 'ff', 'text': 'fff' }, { 'title': 'super', 'text': 'chouette' }, {
            'title': 'ff',
            'text': 'fff'
        }, { 'title': 'ff', 'text': '' }, { 'title': '', 'text': 'fff' }, null],
        'commentsRejectedArray': []
    };
    let expectedEmptyRejectedBuildCommentsStats = {
        '_id': 'Campagne01-12.05.17',
        'date': '2017-06-07T13:40:50.132Z',
        'mailSent': 9,
        'mailOpen': 0,
        'linkClick': 0,
        'pageOne': 0,
        'formValidated': 3,
        'allowToContact': 1,
        'comments': 5,
        'commentsRejected': 0
    };

    let inputEmptyCommentsdBuildCommentsStats = {
        '_id': 'Campagne01-12.05.17',
        'date': '2017-06-07T13:40:50.132Z',
        'mailSent': 9,
        'mailOpen': 0,
        'linkClick': 0,
        'pageOne': 0,
        'formValidated': 3,
        'allowToContact': 1,
        'commentsArray': [],
        'commentsRejectedArray': [{ pseudo: true, comment: false, commentTitle: true }]
    };
    let expectedCommentsBuildCommentsStats = {
        '_id': 'Campagne01-12.05.17',
        'date': '2017-06-07T13:40:50.132Z',
        'mailSent': 9,
        'mailOpen': 0,
        'linkClick': 0,
        'pageOne': 0,
        'formValidated': 3,
        'allowToContact': 1,
        'comments': 0,
        'commentsRejected': 1
    };

    describe('buildCommentsStats', function() {
        it('should build a well formed object when both comments and rejected array are not empty', function() {
            let builtObject = dataExposer.buildCommentsStats(inputObjectFullBuildCommentsStats);
            assert.deepEqual(builtObject, expectedObjectFullBuildCommentsStats);
        });

        it('should build a well formed object when rejected array is empty and comments array is not empty', function() {
            let builtObject = dataExposer.buildCommentsStats(inputEmptyRejectedBuildCommentsStats);
            assert.deepEqual(builtObject, expectedEmptyRejectedBuildCommentsStats);
        });

        it('should build a well formed object when rejected array is not empty and comments array is empty', function() {
            let builtObject = dataExposer.buildCommentsStats(inputEmptyCommentsdBuildCommentsStats);
            assert.deepEqual(builtObject, expectedCommentsBuildCommentsStats);
        });
    });
});
