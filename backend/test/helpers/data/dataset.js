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
    newIntercarif: (options = {}) => {
        //same data as in test/helpers/data/intercarif-data-test.xml
        let numeroFormation = options.numeroFormation || 'F_XX_XX';
        let numeroAction = options.numeroAction || 'AC_XX_XXXXXX';
        let numeroSession = options.numeroSession || 'SE_XXXXXX';
        let formacode = options.formacode || '224032422722';
        let certifinfo = options.certifinfo || '80735';
        let codeRegion = options.codeRegion || '11';
        let lieuDeFormation = options.lieuDeFormation || '93100';
        let organismeFormateur = options.organismeFormateur || '22222222222222';

        return {
            _attributes: {
                numero: numeroFormation,
                datecrea: '20010503',
                datemaj: '20171213',
                file: 'https://anotea.pole-emploi.fr',
                href: 'https://anotea.pole-emploi.fr'
            },
            domaine_formation: {
                code_formacodes: [
                    {
                        _value: formacode,
                        _attributes: {
                            ref: 'V12',
                            tag: 'principal'
                        }
                    }
                ],
                code_nsfs: [
                    '233'
                ],
                code_romes: [
                    'F1604'
                ]
            },
            intitule_formation: 'Développeur web',
            objectif_formation: 'L\'objectif est d\'obtenir la qualification de développeur web, pour un accès à l\'emploi.',
            resultats_attendus: '-',
            contenu_formation: 'Réaliser le développement d\'application web.',
            certifiante: '1',
            contact_formation: {
                coordonnefs: {
                    civilite: 'Madame',
                    nom: 'Martin',
                    prenom: 'Henri',
                    adresse: {
                        codepostal: lieuDeFormation,
                        ville: 'Montreuil',
                        departement: '93',
                        code_insee_commune: lieuDeFormation,
                        region: codeRegion,
                        pays: 'FR',
                        geolocalisation: {
                            latitude: '47',
                            longitude: '0'
                        },
                        lignes: [
                            '-'
                        ],
                        code_region: codeRegion
                    },
                    telfixe: {
                        numtels: [
                            '01 11 11 11 11'
                        ]
                    },
                    portable: {
                        numtels: [
                            '06 22 22 22 22'
                        ]
                    },
                    courriel: 'anotea.pe@gmail.com',
                    web: {
                        urlwebs: [
                            'https://anotea.pole-emploi.fr'
                        ]
                    }
                }
            },
            parcours_de_formation: '3',
            code_niveau_entree: '1',
            objectif_general_formation: '6',
            code_niveau_sortie: '4',
            url_formation: {
                urlwebs: [
                    'https://anotea.pole-emploi.fr'
                ]
            },
            organisme_formation_responsable: {
                _attributes: {
                    numero: 'OR_XX_XXX'
                },
                numero_activite: '24930181111',
                siret_organisme_formation: {
                    siret: '11111111111111'
                },
                nom_organisme: 'Anotea Formation',
                raison_sociale: 'Centre de formation Anotéa',
                coordonnees_organisme: {
                    coordonnees: {
                        adresse: {
                            codepostal: lieuDeFormation,
                            ville: 'Montreuil',
                            departement: '93',
                            code_insee_commune: lieuDeFormation,
                            region: codeRegion,
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '47',
                                longitude: '0'
                            },
                            lignes: [
                                '-'
                            ],
                            code_region: codeRegion
                        },
                        telfixe: {
                            numtels: [
                                '11 11'
                            ]
                        },
                        fax: {
                            numtels: [
                                '01 11 22 33 44'
                            ]
                        },
                        web: {
                            urlwebs: [
                                'https://anotea.pole-emploi.fr'
                            ]
                        }
                    }
                },
                contact_organisme: {
                    coordonnees: {
                        nom: 'Martino',
                        prenom: 'Jacko',
                        adresse: {
                            codepostal: lieuDeFormation,
                            ville: 'Montreuil',
                            departement: '93',
                            code_insee_commune: lieuDeFormation,
                            region: codeRegion,
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '47',
                                longitude: '0'
                            },
                            lignes: [
                                '-'
                            ],
                            code_region: codeRegion
                        },
                        telfixe: {
                            numtels: [
                                '1111'
                            ]
                        },
                        fax: {
                            numtels: [
                                '01 11 22 33 44'
                            ]
                        },
                        courriel: 'anotea.pe+responsable@gmail.com',
                        web: {
                            urlwebs: [
                                'https://anotea.pole-emploi.fr'
                            ]
                        }
                    }
                },
                potentiel: {
                    code_formacodes: [
                        {
                            _value: '13307',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '15061',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '15062',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '15070',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '21046',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '21047',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '21050',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '21546',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '21572',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22001',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22002',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22005',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22010',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22013',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22016',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22022',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22024',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22026',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22042',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22048',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22050',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22054',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22062',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22067',
                            _attributes: {
                                ref: 'V12'
                            }
                        },
                        {
                            _value: '22069',
                            _attributes: {
                                ref: 'V12'
                            }
                        }
                    ]
                }
            },
            certifications: [
                {
                    code_rncp: '320',
                    code_certifinfo: certifinfo
                }
            ],
            actions: [{
                _attributes: {
                    numero: numeroAction,
                    datecrea: '20010503',
                    datemaj: '20171213'
                },
                rythme_formation: 'Continu temps plein, Modulaire',
                niveau_entree_obligatoire: '0',
                modalites_alternance: '-',
                modalites_enseignement: '0',
                conditions_specifiques: '-',
                prise_en_charge_frais_possible: '0',
                lieu_de_formation: {
                    coordonnees: {
                        nom: 'Anotea Formation Paris',
                        adresse: {
                            codepostal: '75019',
                            ville: 'Paris',
                            departement: '75',
                            code_insee_commune: '75019',
                            region: codeRegion,
                            code_region: codeRegion,
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '48',
                                longitude: '2'
                            },
                            lignes: [
                                '-'
                            ],
                        },
                        telfixe: {
                            numtels: [
                                '11 11'
                            ]
                        },
                        fax: {
                            numtels: [
                                '01 11 22 33 44'
                            ]
                        },
                        web: {
                            urlwebs: [
                                'https://anotea.pole-emploi.fr'
                            ]
                        }
                    }
                },
                modalites_entrees_sorties: '0',
                url_action: {
                    urlwebs: [
                        'https://anotea.pole-emploi.fr'
                    ]
                },
                adresse_information: {
                    adresse: {
                        codepostal: '75019',
                        ville: 'Paris',
                        departement: '75',
                        code_insee_commune: '75019',
                        region: codeRegion,
                        pays: 'FR',
                        geolocalisation: {
                            latitude: '48',
                            longitude: '2'
                        },
                        lignes: [
                            '-'
                        ],
                        code_region: codeRegion
                    }
                },
                acces_handicapes: 'Accès handicapé possible',
                langue_formation: 'FR',
                modalites_recrutement: 'Entretien, Tests',
                code_perimetre_recrutement: '3',
                nombre_heures_centre: '585',
                nombre_heures_entreprise: '112',
                nombre_heures_total: '697',
                conventionnement: '1',
                organisme_formateur: {
                    _attributes: {
                        numero: 'OF_XXX'
                    },
                    siret_formateur: {
                        siret: organismeFormateur
                    },
                    raison_sociale_formateur: 'Anotea Formation Paris',
                    contact_formateur: {
                        coordonnees: {
                            nom: 'Martina',
                            prenom: 'Jacko',
                            adresse: {
                                codepostal: '75019',
                                ville: 'Paris',
                                departement: '75',
                                code_insee_commune: '75019',
                                region: codeRegion,
                                pays: 'FR',
                                geolocalisation: {
                                    latitude: '48',
                                    longitude: '2'
                                },
                                lignes: [
                                    '-'
                                ],
                                code_region: codeRegion
                            },
                            telfixe: {
                                numtels: [
                                    '1111'
                                ]
                            },
                            fax: {
                                numtels: [
                                    '01 11 22 33 44'
                                ]
                            },
                            courriel: 'anotea.pe+paris@gmail.com',
                            web: {
                                urlwebs: [
                                    'https://anotea.pole-emploi.fr'
                                ]
                            }
                        }
                    },
                    potentiel: {
                        code_formacodes: [
                            {
                                _value: '13307',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '15061',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '15062',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '15070',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '21046',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '21047',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '21050',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '21546',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '21572',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22001',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22002',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22005',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22010',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22013',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22016',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22022',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22024',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22026',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22042',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22048',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22050',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22054',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22062',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22067',
                                _attributes: {
                                    ref: 'V12'
                                }
                            },
                            {
                                _value: '22069',
                                _attributes: {
                                    ref: 'V12'
                                }
                            }
                        ]
                    }
                },
                code_public_vises: [
                    {
                        _value: '83056',
                        _attributes: {
                            ref: 'V12'
                        }
                    }
                ],
                sessions: [{
                    _attributes: {
                        numero: numeroSession,
                        datecrea: '20010503',
                        datemaj: '20171213'
                    },
                    periode: {
                        debut: '20171030',
                        fin: '20180601'
                    },
                    adresse_inscription: {
                        adresse: {
                            codepostal: '75019',
                            ville: 'Paris',
                            departement: '75',
                            code_insee_commune: '75019',
                            region: codeRegion,
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '48',
                                longitude: '2'
                            },
                            lignes: [
                                '-'
                            ],
                            code_region: codeRegion
                        }
                    },
                    periode_inscription: {
                        periode: {
                            debut: '00000000',
                            fin: '20180522'
                        }
                    },
                    etat_recrutement: '1'
                }],
                date_informations: [
                    {
                        date: '00000000'
                    }
                ],
                organisme_financeurs: [
                    {
                        code_financeur: '2',
                        nb_places_financees: '5'
                    }
                ]
            }],
            _meta: {
                certifinfos: [certifinfo],
                formacodes: [formacode]
            },
            md5: '863aab7eacec39772b8f0f8336579bec'
        };
    }
};
