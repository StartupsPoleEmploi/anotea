const _ = require('lodash');
const uuid = require('uuid');
const ObjectID = require('mongodb').ObjectID;

const randomize = value => `${value}-${uuid.v4()}`;
const randomSIRET = () => `${Math.floor(Math.random() * 9000000000) + 1000000000}`;

let newComment = (custom, date = new Date()) => {
    return _.merge({
        _id: new ObjectID(),
        token: randomize('token-12345'),
        campaign: 'test-mocha',
        formacode: '46242',
        idSession: '2422722',
        training: {
            idFormation: '14_AF_0000011111',
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
                numeroAction: '14_SE_0000092458',
                numeroSession: 'SE_0000050645'
            },
            codeFinanceur: '10'
        },
        step: 3,
        rates: {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2
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
        lastModerationAction: date,
        read: true,
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
    newTrainee: custom => {
        return _.merge({
            _id: `${randomize('test-campaign')}`,
            campaign: 'test-campaign',
            importDate: new Date(),
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
                idFormation: '14_AF_0000011111',
                title: 'Développeur',
                startDate: new Date(),
                scheduledEndDate: new Date(),
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
                    numeroAction: '14_SE_0000092458',
                    numeroSession: 'SE_0000050645'
                },
                codeFinanceur: '10'
            },
            unsubscribe: false,
            mailSent: true,
            token: randomize('token'),
            mailSentDate: new Date(),
            tracking: {
                firstRead: new Date()
            },
            codeRegion: '11'
        }, custom);
    },
    newModerateurAccount: custom => {
        return _.merge({
            courriel: 'admin@pole-emploi.fr',
            password: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
            codeRegion: '11'
        }, custom);
    },
    newOrganismeAccount: custom => {
        return _.merge({
            _id: 6080274100045,
            SIRET: 6080274100045,
            raisonSociale: 'Pole Emploi Formation',
            courriel: 'contact@poleemploi-formation.fr',
            passwordHash: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
            creationDate: new Date(),
            token: randomize('token'),
            mailSentDate: new Date(),
            meta: {
                siretAsString: '6080274100045'
            },
            codeRegion: '11',
        }, custom);
    },
    newFinancerAccount: custom => {
        return _.merge({
            courriel: 'contact@financer.fr',
            password: '$2b$10$9kI8ub4e/yw51/nWF8IlOuGQRjvvgVIPfsLB/aKuAXlIuiiyLy/4C',
            codeRegion: '11',
            raisonSocial: 'Conseil Regional',
            codeFinanceur: '2'
        }, custom);
    },
    newForgottenPasswordToken: custom => {
        return _.merge({
            token: randomize('token'),
            id: uuid.v4(),
        }, custom, { test: true });
    },
    newComment: newComment,
    newSession: custom => {
        return _.merge({
            _id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            numero: 'SE_XXXXXX',
            avis: !custom.avis ? [newComment()] : null,
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 4,
                    contenu_formation: 4,
                    equipe_formateurs: 4,
                    moyen_materiel: 4,
                    accompagnement: 4,
                    global: 4
                }
            },
            meta: {
                reconciliation: {
                    organisme_formateur: '11111111111111',
                    lieu_de_formation: '49000',
                    certifinfos: [
                        '55518'
                    ],
                    formacodes: [
                        '31801'
                    ]
                },
                source: {
                    type: 'intercarif',
                    numero_formation: 'F_XX_XX',
                    numero_action: 'AC_XX_XXXXXX',
                    numero_session: 'SE_XXXXXX',
                }
            }
        }, custom, { test: true });
    },
    newAction: custom => {
        return _.merge({
            _id: 'F_XX_XX|AC_XX_XXXXXX',
            numero: 'AC_XX_XXXXXX',
            region: '11',
            avis: !custom.avis ? [newComment()] : null,
            score: {
                nb_avis: 1,
                notes: {
                    accueil: 4,
                    contenu_formation: 4,
                    equipe_formateurs: 4,
                    moyen_materiel: 4,
                    accompagnement: 4,
                    global: 4
                }
            },
            meta: {
                reconciliation: {
                    organisme_formateur: '11111111111111',
                    lieu_de_formation: '49000',
                    certifinfos: [
                        '55518'
                    ],
                    formacodes: [
                        '31801'
                    ]
                },
                source: {
                    type: 'intercarif',
                    numero_formation: 'F_XX_XX',
                    numero_action: 'AC_XX_XXXXXX',
                }
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
            adresse: {
                code_postal: '45160',
                ville: 'Olivet',
                region: '24'
            },
            organisme_formateurs: [
                {
                    siret: '22222222222222',
                    numero: 'OF_XXX',
                    raison_sociale: 'PE Formation',
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
    newFormation: custom => {
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
