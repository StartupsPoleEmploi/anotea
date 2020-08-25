const _ = require('lodash');
const uuid = require('uuid');
const moment = require('moment');
const { ObjectId } = require('mongodb');

const randomize = value => `${value}-${uuid.v4()}`;
const randomSIRET = () => `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
const getDateInThePast = () => moment().subtract('100', 'days').toDate();

module.exports = {
    randomize,
    randomSIRET,
    newStagiaire: (custom, date = getDateInThePast()) => {
        return _.merge({
            _id: `${randomize('test-campaign')}`,
            campaign: 'test-campaign',
            importDate: date,
            avisCreated: false,
            refreshKey: '667debb89cf76c83816e5f9dbc7c808e',
            dispositifFinancement: 'AIF',
            individu: {
                nom: 'Dupont',
                prenom: 'Henri',
                email: 'henri@email.fr',
                telephones: [
                    '0123456789',
                    'NULL'
                ],
                emailValid: true,
                identifiant_pe: '1111111111'
            },
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur',
                domaine_formation: {
                    formacodes: ['46242'],
                },
                certifications: [{ certif_info: '78997' }],
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75011',
                        ville: 'Paris',
                    },
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        label: 'Pole Emploi Formation',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        id: '2422722',
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date,
                            fin: date,
                        },
                    },
                },
            },
            unsubscribe: false,
            mailSent: true,
            mailSentDate: date,
            token: randomize('token'),
            tracking: {
                firstRead: date
            },
            codeRegion: '11'
        }, custom);
    },
    newModerateurAccount: custom => {
        return _.merge({
            identifiant: 'admin@pole-emploi.fr',
            passwordHash: '5f4dcc3b5aa765d61d8327deb882cf99',
            codeRegion: '11',
            profile: 'moderateur'
        }, custom);
    },
    newOrganismeAccount: (custom = {}) => {
        return _.merge({
            _id: custom._id || parseInt(custom.siret || '6080274100045'),
            siret: '6080274100045',
            raison_sociale: 'Pole Emploi Formation',
            courriel: 'contact@poleemploi-formation.fr',
            courriels: [{ courriel: 'contact@poleemploi-formation.fr', source: 'intercarif' }],
            passwordHash: '5f4dcc3b5aa765d61d8327deb882cf99',
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
                },
                aggregation: {
                    global: {
                        max: 5.1,
                        min: 1,
                    },
                },
            },
            profile: 'organisme'
        }, custom);
    },
    newFinancerAccount: custom => {
        return _.merge({
            identifiant: 'contact@financer.fr',
            passwordHash: '5f4dcc3b5aa765d61d8327deb882cf99',
            codeRegion: '11',
            raison_sociale: 'Conseil Regional',
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
    newAvis: (custom, date = getDateInThePast()) => {
        return _.merge({
            _id: new ObjectId(),
            token: randomize('token'),
            campaign: 'test-campaign',
            formation: {
                numero: 'F_XX_XX',
                intitule: 'Développeur',
                domaine_formation: {
                    formacodes: ['46242'],
                },
                certifications: [{ certif_info: '78997' }],
                action: {
                    numero: 'AC_XX_XXXXXX',
                    lieu_de_formation: {
                        code_postal: '75011',
                        ville: 'Paris',
                    },
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        label: 'Pole Emploi Formation',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        id: '2422722',
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date,
                            fin: date,
                        },
                    },
                },
            },
            notes: {
                accueil: 3,
                contenu_formation: 2,
                equipe_formateurs: 4,
                moyen_materiel: 2,
                accompagnement: 1,
                global: 2.4,
            },
            commentaire: {
                title: 'Génial',
                text: 'Super formation.'
            },
            date: date,
            status: 'validated',
            qualification: 'positif',
            lastStatusUpdate: date,
            read: true,
            codeRegion: '11',
            dispositifFinancement: 'AIF',
        }, custom, { test: true });
    },
    newIntercarif: (options = {}) => {
        //same data as in test/helpers/data/intercarif-data-test.xml
        let numeroFormation = options.numeroFormation || 'F_XX_XX';
        let numeroAction = options.numeroAction || 'AC_XX_XXXXXX';
        let numeroSession = options.numeroSession || 'SE_XXXXXX';
        let formacode = options.formacode || '224032422722';
        let certifInfo = options.certifInfo || '80735';
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
                coordonnees: {
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
                    code_certifinfo: certifInfo
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
                certifinfos: [certifInfo],
                formacodes: [formacode]
            },
            md5: '863aab7eacec39772b8f0f8336579bec'
        };
    }
};
