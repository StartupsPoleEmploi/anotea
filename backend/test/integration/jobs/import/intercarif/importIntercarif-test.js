const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const importIntercarif = require('../../../../../src/jobs/import/intercarif/tasks/importIntercarif');
const logger = require('../../../../helpers/components/fake-logger');

describe(__filename, withMongoDB(({ getTestDatabase }) => {

    let intercarifFile = path.join(__dirname, '../../../../helpers/data', 'intercarif-data-test.xml');

    it('should import formation', async () => {

        let db = await getTestDatabase();

        await importIntercarif(db, logger, intercarifFile);

        let formation = await db.collection('intercarif').findOne({ '_attributes.numero': 'F_XX_XX' });
        assert.strictEqual(formation.md5.length, 32);
        assert.deepStrictEqual(_.omit(formation, ['_id', 'md5']), {
            _attributes: {
                numero: 'F_XX_XX',
                datecrea: '20010503',
                datemaj: '20171213',
                file: 'https://anotea.pole-emploi.fr',
                href: 'https://anotea.pole-emploi.fr'
            },
            domaine_formation: {
                code_formacodes: [
                    {
                        _value: '22403',
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
                    courriel: "anotea.pe@gmail.com",
                    nom: 'Martin',
                    prenom: 'Henri',
                    adresse: {
                        codepostal: '93100',
                        ville: 'Montreuil',
                        departement: '93',
                        code_insee_commune: '93100',
                        region: '11',
                        pays: 'FR',
                        geolocalisation: {
                            latitude: '47',
                            longitude: '0'
                        },
                        lignes: [
                            '-'
                        ]
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
                            codepostal: '93100',
                            ville: 'Montreuil',
                            departement: '93',
                            code_insee_commune: '93100',
                            region: '11',
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '47',
                                longitude: '0'
                            },
                            lignes: [
                                '-'
                            ]
                        },
                        courriel: "responsable@tata.com",
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
                            codepostal: '93100',
                            ville: 'Montreuil',
                            departement: '93',
                            code_insee_commune: '93100',
                            region: '11',
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '47',
                                longitude: '0'
                            },
                            lignes: [
                                '-'
                            ]
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
                    code_certifinfo: '80735'
                }
            ],
            actions: [
                {
                    _attributes: {
                        numero: 'AC_XX_XXXXXX',
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
                                region: '11',
                                pays: 'FR',
                                geolocalisation: {
                                    latitude: '48',
                                    longitude: '2'
                                },
                                lignes: [
                                    '-'
                                ]
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
                            region: '11',
                            pays: 'FR',
                            geolocalisation: {
                                latitude: '48',
                                longitude: '2'
                            },
                            lignes: [
                                '-'
                            ]
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
                            numero: 'OF_XXX',
                        },
                        siret_formateur: {
                            siret: '22222222222222'
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
                                    region: '11',
                                    pays: 'FR',
                                    geolocalisation: {
                                        latitude: '48',
                                        longitude: '2'
                                    },
                                    lignes: [
                                        '-'
                                    ]
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
                    sessions: [
                        {
                            _attributes: {
                                numero: 'SE_XXXXXX',
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
                                    region: '11',
                                    pays: 'FR',
                                    geolocalisation: {
                                        latitude: '48',
                                        longitude: '2'
                                    },
                                    lignes: [
                                        '-'
                                    ]
                                }
                            },
                            periode_inscription: {
                                periode: {
                                    debut: '00000000',
                                    fin: '20180522'
                                }
                            },
                            etat_recrutement: '1'
                        }
                    ],
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
                }
            ],
            _meta: {
                certifinfos: [
                    '80735'
                ],
                formacodes: [
                    '22403'
                ]
            },
        });
    });

    it('should remove all documents when importing formations', async () => {

        let db = await getTestDatabase();

        await importIntercarif(db, logger, intercarifFile);
        await importIntercarif(db, logger, intercarifFile);

        let count = await db.collection('intercarif').countDocuments({});
        assert.strictEqual(count, 1);
    });
}));
