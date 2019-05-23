const _ = require('lodash');
const uuid = require('uuid');
const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;

const randomize = value => `${value}-${uuid.v4()}`;
const randomSIRET = () => `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
const getDateInThePast = () => moment().subtract('100', 'days').toDate();

let newComment = (custom, date = getDateInThePast()) => {
    return _.merge({
        _id: new ObjectID(),
        token: randomize('token-12345'),
        campaign: 'test',
        formacode: '46242',
        idSession: '2422722',
        training: {
            idFormation: 'F_XX_XX',
            title: 'Développeur',
            startDate: date,
            scheduledEndDate: date,
            organisation: {
                id: '14_OF_XXXXXXXXXX',
                siret: '11111111111111',
                label: 'Pole Emploi Formation',
                name: 'INSTITUT DE FORMATION'
            },
            place: {
                postalCode: '75011',
                city: 'Paris'
            },
            certifInfo: {
                id: '78997',
                label: 'Développeur'
            },
            idSession: '2422722',
            formacode: '46242',
            aesRecu: 'AES',
            referencement: '41C561691111',
            idSessionAudeFormation: '2422722',
            infoCarif: {
                numeroAction: 'AC_XX_XXXXXX',
                numeroSession: 'SE_XXXXXX'
            },
            codeFinanceur: '10'
        },
        rates: {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.4,
        },
        pseudo: randomize('pseudo'),
        comment: {
            title: 'Génial',
            text: 'Super formation.'
        },
        date: date,
        accord: false,
        reported: false,
        moderated: true,
        published: true,
        rejected: false,
        rejectReason: null,
        qualification: 'positif',
        lastStatusUpdate: date,
        read: true,
        importDate: date,
        unsubscribe: false,
        mailSent: true,
        mailSentDate: date,
        mailRetry: 2,
        tracking: {
            firstRead: date,
            lastRead: date
        },
        deviceTypes: {
            phone: 0,
            tablet: 0,
            desktop: 1
        },
        codeRegion: '11',
    }, custom, { test: true });
};

module.exports = {
    randomize,
    randomSIRET,
    newTrainee: (custom, date = getDateInThePast()) => {
        return _.merge({
            _id: `${randomize('test-campaign')}`,
            campaign: 'test-campaign',
            importDate: date,
            trainee: {
                name: 'Dupont',
                firstName: 'Henri',
                mailDomain: 'free.fr',
                email: 'henri@email.fr',
                phoneNumbers: [
                    '0123456789',
                    'NULL'
                ],
                emailValid: true,
                dnIndividuNational: '1111111111'
            },
            training: {
                idFormation: 'F_XX_XX',
                title: 'Développeur',
                startDate: date,
                scheduledEndDate: date,
                organisation: {
                    id: '14_OF_XXXXXXXXXX',
                    siret: '11111111111111',
                    label: 'Pole Emploi Formation',
                    name: 'INSTITUT DE FORMATION'
                },
                place: {
                    postalCode: '75011',
                    city: 'Paris'
                },
                certifInfo: {
                    id: '78997',
                    label: 'Développeur'
                },
                idSession: '2422722',
                formacode: '46242',
                aesRecu: 'AES',
                referencement: '41C561691111',
                idSessionAudeFormation: '2422722',
                infoCarif: {
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX'
                },
                codeFinanceur: '10'
            },
            unsubscribe: false,
            mailSent: true,
            token: randomize('token'),
            mailSentDate: date,
            tracking: {
                firstRead: date
            },
            codeRegion: '11'
        }, custom);
    },
    newModerateurAccount: custom => {
        return _.merge({
            courriel: 'admin@pole-emploi.fr',
            passwordHash: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
            codeRegion: '11',
            profile: 'moderateur'
        }, custom);
    },
    newOrganismeAccount: custom => {
        return _.merge({
            _id: 6080274100045,
            SIRET: 6080274100045,
            raisonSociale: 'Pole Emploi Formation',
            courriel: 'contact@poleemploi-formation.fr',
            passwordHash: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
            creationDate: getDateInThePast(),
            token: randomize('token'),
            mailSentDate: getDateInThePast(),
            codeRegion: '11',
            numero: '14_OF_0000000123',
            lieux_de_formation: [
                {
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris 19e',
                        region: '11'
                    }
                }
            ],
            score: {
                nb_avis: 15,
                notes: {
                    accueil: 5.1,
                    contenu_formation: 5.1,
                    equipe_formateurs: 4.1,
                    moyen_materiel: 3.1,
                    accompagnement: 4.1,
                    global: 5.1,
                }
            },
            meta: {
                siretAsString: '6080274100045',
            },
            profile: 'organisme'
        }, custom);
    },
    newFinancerAccount: custom => {
        return _.merge({
            courriel: 'contact@financer.fr',
            passwordHash: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
            codeRegion: '11',
            raisonSociale: 'Conseil Regional',
            codeFinanceur: '2',
            profile: 'financeur'
        }, custom);
    },
    newForgottenPasswordToken: custom => {
        return _.merge({
            token: randomize('token'),
            id: uuid.v4(),
        }, custom, { test: true });
    },
    newComment: newComment,
    newSession: (custom = {}) => {

        let avis = custom.avis ? custom.avis : [newComment()];
        let numeroFormation = 'F_XX_XX';
        let numeroAction = 'AC_XX_XXXXXX';
        let numeroSession = 'SE_XXXXXX';

        if (custom._id) {
            [numeroFormation, numeroAction, numeroSession] = custom._id.split('|');
        }

        return _.merge({
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            numero: numeroSession,
            region: '11',
            code_region: '11',
            avis: avis,
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 4.1,
                    contenu_formation: 4.1,
                    equipe_formateurs: 4.1,
                    moyen_materiel: 4.1,
                    accompagnement: 4.1,
                    global: 4.1,
                }
            },
            formation: {
                numero: numeroFormation,
                intitule: 'Développeur web',
                domaine_formation: {
                    formacodes: ['31801']
                },
                certifications: {
                    certifinfos: ['55518']
                },
                action: {
                    numero: numeroAction,
                    lieu_de_formation: {
                        code_postal: '75019',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [
                        '2'
                    ],
                    organisme_formateur: {
                        raison_sociale: 'Anotea Formation Paris',
                        siret: '22222222222222',
                        numero: 'OF_XXX'
                    }
                }
            },
            meta: {
                source: {
                    numero_formation: numeroFormation,
                    numero_action: numeroAction,
                    numero_session: numeroSession,
                    type: 'intercarif',
                },
                reconciliation: {
                    organisme_formateur: '22222222222222',
                    lieu_de_formation: '75019',
                    certifinfos: ['55518'],
                    formacodes: ['31801']
                },
            }
        }, custom, { test: true });
    },
    newAction: (custom = {}) => {

        let numeroFormation = 'F_XX_XX';
        let numeroAction = 'AC_XX_XXXXXX';
        let avis = custom.avis ? custom.avis : [newComment()];

        if (custom._id) {
            [numeroFormation, numeroAction] = custom._id.split('|');
        }

        return _.merge({
            _id: 'F_XX_XX|AC_XX_XXXXXX',
            numero: numeroAction,
            region: '11',
            avis: avis,
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 4.1,
                    contenu_formation: 4.1,
                    equipe_formateurs: 4.1,
                    moyen_materiel: 4.1,
                    accompagnement: 4.1,
                    global: 4.1,
                }
            },
            organisme_financeurs: ['2'],
            organisme_formateur: {
                raison_sociale: 'Anotea Formation Paris',
                siret: '22222222222222',
                numero: 'OF_XXX'
            },
            lieu_de_formation: {
                code_postal: '75019',
                ville: 'Paris'
            },
            formation: {
                numero: numeroFormation,
                intitule: 'Développeur web',
                domaine_formation: {
                    formacodes: ['31801']
                },
                certifications: {
                    certifinfos: ['55518']
                },
            },
            meta: {
                source: {
                    numero_formation: numeroFormation,
                    numero_action: numeroAction,
                    type: 'intercarif',
                },
                reconciliation: {
                    organisme_formateur: '11111111111111',
                    lieu_de_formation: '49000',
                    certifinfos: ['55518'],
                    formacodes: ['31801']
                },
            }
        }, custom, { test: true });
    },
    newFormation: (custom = {}) => {

        let avis = custom.avis ? custom.avis : [newComment()];
        let numeroFormation = custom._id || 'F_XX_XX';

        return _.merge({
            _id: numeroFormation,
            numero: numeroFormation,
            intitule: 'Développeur web',
            domaine_formation: {
                formacodes: ['31801']
            },
            certifications: {
                certifinfos: ['55518']
            },
            avis: avis,
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 4.1,
                    contenu_formation: 4.1,
                    equipe_formateurs: 4.1,
                    moyen_materiel: 4.1,
                    accompagnement: 4.1,
                    global: 4.1,
                }
            },
            meta: {
                source: {
                    numero_formation: numeroFormation,
                    type: 'intercarif',
                },
                reconciliation: {
                    organisme_formateurs: ['11111111111111'],
                    certifinfos: ['55518'],
                    formacodes: ['31801']
                },
            }
        }, custom, { test: true });
    },
    newOrganismeFormateur: custom => {
        let siret = randomSIRET();
        return _.merge({
            _id: siret,
            siret: siret,
            numero: 'OF_XXX',
            raison_sociale: 'Pole Emploi Formation',
            courriel: 'contact@poleemploi-formation.fr',
            lieux_de_formation: [
                {
                    adresse: {
                        code_postal: '75011',
                        ville: 'Paris 11e',
                        region: '11'
                    }
                }
            ],
            regions: ['11'],
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 2,
                    contenu_formation: 3,
                    equipe_formateurs: 2,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2
                }
            }
        }, custom, { test: true });
    },
    newOrganismeResponsable: custom => {
        return _.merge({
            numero: '07_452',
            siret: '11111111111111',
            nom: 'PE Formation',
            raison_sociale: 'Pole Emploi Formation',
            courriel: 'contact@organisme-responsable.fr',
            adresse: {
                code_postal: '45160',
                ville: 'Olivet',
                region: '24'
            },
            organisme_formateurs: [
                {
                    _id: '22222222222222',
                    siret: '22222222222222',
                    numero: 'OF_XXX',
                    raison_sociale: 'PE Formation',
                    courriel: 'contact@poleemploi-formation.fr',
                    lieux_de_formation: [
                        {
                            nom: 'PE Formation',
                            adresse: {
                                code_postal: '37250',
                                ville: 'Veigné',
                                region: '24'
                            }
                        }
                    ]
                }
            ]
        }, custom, { test: true });
    },
    newCarif: custom => {
        return _.merge({
            codeRegion: '11',
            name: 'Défi Métiers',
            url: 'https://www.defi-metiers.fr/',
            formLinkEnabled: true,
            courriel: 'anotea-idf@pole-emploi.fr',
            carifNameHidden: false
        }, custom);
    },
    newIntercarif: custom => {
        return _.merge({
            _attributes: {
                numero: '14_AF_0000011111',
                datecrea: '20120213',
                datemaj: '20171025',
                file: 'http://www.defi-metiers.fr/lheo/file.xml',
                href: 'http://www.defi-metiers.fr/dm_search/formation/AF_XXXXX'
            },
            domaine_formation: {
                code_formacodes: [
                    {
                        _value: '22252',
                        _attributes: {
                            ref: 'V12'
                        }
                    },
                    {
                        _value: '22398',
                        _attributes: {
                            ref: 'V12',
                            tag: 'principal'
                        }
                    }
                ],
                code_nsfs: [
                    '254'
                ],
                code_romes: [
                    'F1104'
                ]
            },
            intitule_formation: 'Titre professionnel développeur',
            objectif_formation: 'Apprendre à developper',
            resultats_attendus: 'Titre professionnel développeur',
            contenu_formation: 'Module 1.',
            certifiante: '1',
            contact_formation: {
                coordonnees: {
                    civilite: 'Mme ou M.',
                    telfixe: {
                        numtels: [
                            '18 18'
                        ]
                    },
                    courriel: 'contact@organisme.fr'
                }
            },
            parcours_de_formation: '1',
            code_niveau_entree: '4',
            objectif_general_formation: '6',
            code_niveau_sortie: '5',
            url_formation: {
                urlwebs: ['https://url']
            },
            organisme_formation_responsable: {
                _attributes: {
                    numero: '14_OF_XXXXXXXXX1'
                },
                numero_activite: '11930741111',
                siret_organisme_formation: {
                    siret: '22222222222222'
                },
                nom_organisme: 'Pole Emploi Formation',
                raison_sociale: 'Pole Emploi Formation',
                coordonnees_organisme: {
                    coordonnees: {
                        _attributes: {
                            numero: '14_AD_0000011111'
                        },
                        adresse: {
                            codepostal: '93100',
                            ville: 'Montreuil',
                            departement: '93',
                            code_insee_commune: '93048',
                            region: '11',
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '48.8',
                                longitude: '2.4'
                            },
                            lignes: [
                                'Pole Emploi Formation',
                            ]
                        },
                        telfixe: {
                            numtels: [
                                '18 18'
                            ]
                        },
                        courriel: 'contact@organisme-responsable.fr'
                    }
                },
                contact_organisme: {
                    coordonnees: {
                        civilite: 'Mme ou M.',
                        telfixe: {
                            numtels: [
                                '18 18'
                            ]
                        },
                        courriel: 'contact@organisme-responsable.fr'
                    }
                },
                potentiel: {
                    code_formacodes: [
                        {
                            _value: '31834',
                            _attributes: {
                                ref: 'V12'
                            }
                        }
                    ]
                }
            },
            certifications: [
                {
                    code_rncp: '9159',
                    code_certifinfo: '84310'
                }
            ],
            actions: [
                {
                    _attributes: {
                        numero: '14_SE_0000101111',
                        datecrea: '20170207',
                        datemaj: '20170207'
                    },
                    rythme_formation: 'temps plein',
                    niveau_entree_obligatoire: '0',
                    modalites_alternance: 'Cours du jour : 1106 h - Entreprise : 140 h',
                    modalites_enseignement: '0',
                    conditions_specifiques: 'Bonne vision dans l\'espace.',
                    prise_en_charge_frais_possible: '0',
                    lieu_de_formation: {
                        coordonnees: {
                            _attributes: {
                                numero: '14_AD_0000000111'
                            },
                            adresse: {
                                codepostal: '77420',
                                ville: 'Champs-sur-Marne',
                                departement: '77',
                                code_insee_commune: '77083',
                                region: '11',
                                pays: 'FR',
                                geolocalisation: {
                                    latitude: '48.85',
                                    longitude: '2.58'
                                },
                                lignes: [
                                    'Pole Emploi Formation',
                                    'AVENUE DES LILAS',
                                ]
                            },
                            telfixe: {
                                numtels: [
                                    '18 18'
                                ]
                            },
                            courriel: 'contact@organisme-responsable.fr',
                            web: {
                                urlwebs: [
                                    'http://www.pole-emploi.fr/'
                                ]
                            }
                        }
                    },
                    modalites_entrees_sorties: '0',
                    url_action: {
                        urlwebs: [
                            'https://www.afpa.fr/formation-qualifiante/dev'
                        ]
                    },
                    duree_indicative: '263 jours',
                    nombre_heures_centre: '1106',
                    nombre_heures_entreprise: '140',
                    nombre_heures_total: '1246',
                    conventionnement: '0',
                    organisme_formateur: {
                        _attributes: {
                            numero: '14_OF_XXXXXXXXXX'
                        },
                        siret_formateur: {
                            siret: '33333333333333'
                        },
                        raison_sociale_formateur: 'Pole Emploi Formation Champs',
                        contact_formateur: {
                            coordonnees: {
                                _attributes: {
                                    numero: '14_CO_XXXXXXXXXX'
                                },
                                civilite: 'Mme ou M.',
                                adresse: {
                                    codepostal: '77420',
                                    ville: 'Champs-sur-Marne',
                                    departement: '77',
                                    code_insee_commune: '77083',
                                    region: '11',
                                    pays: 'FR',
                                    geolocalisation: {
                                        latitude: '48.85',
                                        longitude: '2.58'
                                    },
                                    lignes: [
                                        'PE_FORMATION CHAMPS SUR MARNE (77)',
                                        '67 AVENUE DU GENERAL DE GAULLE',
                                    ]
                                },
                                telfixe: {
                                    numtels: [
                                        '18 18'
                                    ]
                                },
                                courriel: 'contact@organisme-responsable.fr',
                                web: {
                                    urlwebs: [
                                        'http://www.pole-emploi.fr/'
                                    ]
                                }
                            }
                        },
                        potentiel: {
                            code_formacodes: [
                                {
                                    _value: '11020',
                                    _attributes: {
                                        ref: 'V12'
                                    }
                                },
                                {
                                    _value: '11502',
                                    _attributes: {
                                        ref: 'V12'
                                    }
                                },
                            ]
                        }
                    },
                    code_public_vises: [
                        {
                            _value: '82044',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '83056',
                            _attributes: {
                                ref: 'V12'
                            }
                        }
                    ],
                    sessions: [
                        {
                            _attributes: {
                                numero: 'SE_0000109418',
                                datecrea: '20170207',
                                datemaj: '20170207'
                            },
                            periode: {
                                debut: '20170911',
                                fin: '20180601'
                            },
                            adresse_inscription: {
                                adresse: {
                                    codepostal: '77420',
                                    ville: 'Champs-sur-Marne',
                                    departement: '77',
                                    code_insee_commune: '77083',
                                    region: '11',
                                    pays: 'FR',
                                    geolocalisation: {
                                        latitude: '48.85',
                                        longitude: '2.58'
                                    },
                                    lignes: [
                                        'PE_FORMATION CHAMPS SUR MARNE (77)',
                                        '67 AVENUE DU GENERAL DE GAULLE',
                                    ]
                                }
                            },
                            etat_recrutement: '1'
                        }
                    ],
                    code_modalite_pedagogiques: [
                        {
                            _value: '96142',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '96312',
                            _attributes: {
                                ref: 'V12'
                            }
                        }
                    ]
                },
                {
                    _attributes: {
                        numero: '14_SE_00001511111',
                        datecrea: '20171025',
                        datemaj: '20171025'
                    },
                    rythme_formation: 'temps plein',
                    niveau_entree_obligatoire: '0',
                    modalites_alternance: 'Cours du jour : 1106 h - Entreprise : 140 h',
                    modalites_enseignement: '0',
                    conditions_specifiques: 'Bonne vision dans l\'espace.',
                    prise_en_charge_frais_possible: '0',
                    lieu_de_formation: {
                        coordonnees: {
                            _attributes: {
                                numero: '14_AD_00000001111'
                            },
                            adresse: {
                                codepostal: '77420',
                                ville: 'Champs-sur-Marne',
                                departement: '77',
                                code_insee_commune: '77083',
                                region: '11',
                                pays: 'FR',
                                geolocalisation: {
                                    latitude: '48.85',
                                    longitude: '2.58'
                                },
                                lignes: [
                                    'PE_FORMATION CHAMPS SUR MARNE (77)',
                                ]
                            },
                            telfixe: {
                                numtels: [
                                    '18 18'
                                ]
                            },
                            courriel: 'contact@organisme-responsable.fr',
                            web: {
                                urlwebs: [
                                    'http://www.pole-emploi.fr/'
                                ]
                            }
                        }
                    },
                    modalites_entrees_sorties: '0',
                    url_action: {
                        urlwebs: [
                            'https://www.afpa.fr/formation-qualifiante/dev'
                        ]
                    },
                    duree_indicative: '263 jours',
                    nombre_heures_centre: '1106',
                    nombre_heures_entreprise: '140',
                    nombre_heures_total: '1246',
                    conventionnement: '0',
                    organisme_formateur: {
                        _attributes: {
                            numero: '14_OF_XXXXXXXXXX'
                        },
                        siret_formateur: {
                            siret: '82422814200108'
                        },
                        raison_sociale_formateur: 'AGENCE NATIONALE',
                        contact_formateur: {
                            coordonnees: {
                                _attributes: {
                                    numero: '14_CO_XXXXXXXXXX'
                                },
                                civilite: 'Mme ou M.',
                                adresse: {
                                    codepostal: '77420',
                                    ville: 'Champs-sur-Marne',
                                    departement: '77',
                                    code_insee_commune: '77083',
                                    region: '11',
                                    pays: 'FR',
                                    geolocalisation: {
                                        latitude: '48.85',
                                        longitude: '2.58'
                                    },
                                    lignes: [
                                        'PE_FORMATION CHAMPS SUR MARNE (77)',
                                    ]
                                },
                                telfixe: {
                                    numtels: [
                                        '18 18'
                                    ]
                                },
                                courriel: 'contact@organisme-responsable.fr',
                                web: {
                                    urlwebs: [
                                        'http://www.pole-emploi.fr/'
                                    ]
                                }
                            }
                        },
                        potentiel: {
                            code_formacodes: [
                                {
                                    _value: '11020',
                                    _attributes: {
                                        ref: 'V12'
                                    }
                                },
                                {
                                    _value: '22480',
                                    _attributes: {
                                        ref: 'V12'
                                    }
                                }
                            ]
                        }
                    },
                    code_public_vises: [
                        {
                            _value: '82044',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '83056',
                            _attributes: {
                                ref: 'V12'
                            }
                        }
                    ],
                    sessions: [
                        {
                            _attributes: {
                                numero: 'SE_0000154239',
                                datecrea: '20171025',
                                datemaj: '20171025'
                            },
                            periode: {
                                debut: '20181001',
                                fin: '20190621'
                            },
                            adresse_inscription: {
                                adresse: {
                                    codepostal: '77420',
                                    ville: 'Champs-sur-Marne',
                                    departement: '77',
                                    code_insee_commune: '77083',
                                    region: '11',
                                    pays: 'FR',
                                    geolocalisation: {
                                        latitude: '48.85',
                                        longitude: '2.58'
                                    },
                                    lignes: [
                                        'PE_FORMATION CHAMPS SUR MARNE (77)',
                                    ]
                                }
                            },
                            etat_recrutement: '1'
                        }
                    ],
                    code_modalite_pedagogiques: [
                        {
                            _value: '96142',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '96312',
                            _attributes: {
                                ref: 'V12'
                            }
                        }
                    ]
                }
            ],
            md5: '6d2c31c7d672891a9363c24c8da1e9fd'
        }, custom, { test: true });
    }
};
