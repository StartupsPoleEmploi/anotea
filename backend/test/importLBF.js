const assert = require('assert');

const mockLogger = {
    info: function() {
    }, error: function() {
    }
};
const mockConfiguration = {};

const buildFormation = require('../jobs/import/lbf/buildFormation.js');
const buildSession = require('../jobs/import/lbf/buildSession.js');
const { buildOrganisme, updateOrganisme } = require('../jobs/import/lbf/buildOrganisme.js');

const formationLine = '1	2016-04-01 14:09:11	2016-11-03 12:41:12	2018-05-14 07:14:35	INACTIVE	0	1	\\N	\\N	0	39_1	39_1	24396 11001 22499 24054	F1602 H1504 I1301 I1307 I1309	Bac pro électrotechnique, énergie, équipements communicants. - Option : habitat /Tertiaire		{"line":{"a":{"type":"text","display":"address"},"c":"Lyc\\u00e9e polyvalent Kahani\\n"},"city":{"a":{"type":"text","display":"address"},"c":"97670, COCONI"},"zipcode":{"a":{"type":"text"},"c":"97670"},"codeinsee":{"a":{"type":"text"},"c":"98518"},"lat":{"a":{"type":"float"},"c":"-12.822095"},"lng":{"a":{"type":"float"},"c":"45.130634"},"tel":{"a":{"type":"tel","display":"contact"},"c":"02 69 62 09 09"},"fax":{"a":{"type":"tel","display":"contact"},"c":"02 69 62 85 10"},"email":{"a":{"type":"email","display":"contact"},"c":"lpo.kahani@ac-mayotte.fr"},"url":{"a":{"type":"url","display":"contact"},"c":"http:\\/\\/sites.ac-mayotte.fr\\/lyckahani\\/"},"session":{"a":{"display":"none","type":"date"},"c":[{"beganat":"2014-08-26","endedat":"2017-06-30"},{"beganat":"2015-08-22","endedat":"2018-06-30"},{"beganat":"2016-08-25","endedat":"2019-07-05"}]},"rncp":{"a":{"display":"none","type":"text","title":"RNCP"},"c":"427"},"objective":{"a":{"display":"body","type":"text"},"c":"Cette formation peut \\u00eatre dispens\\u00e9e selon les \\u00e9tablissements avec une ou plusieurs des sp\\u00e9cialit\\u00e9s suivantes :\\nHabitat tertiaire\\nIndustriel\\nPossibilit\\u00e9 de convention avec la Marine nationale\\nPossibilit\\u00e9 de convention avec l\'Arm\\u00e9e de terre\\nLe titulaire de ce dipl\\u00f4me intervient dans la production, le transport, la distribution et la transformation de l\'\\u00e9nergie \\u00e9lectrique. Il est charg\\u00e9 de la r\\u00e9alisation, de la mise en service et de la maintenance des installations \\u00e9lectriques et des r\\u00e9seaux, de l\'organisation et de la planification des chantiers. Du fait de l\'\\u00e9volution des techniques et des technologies, il intervient \\u00e9galement sur les r\\u00e9seaux et \\u00e9quipements destin\\u00e9s \\u00e0 transmettre et \\u00e0 traiter la voix ou sur ceux li\\u00e9s \\u00e0 la s\\u00e9curit\\u00e9 des personnes et des biens.\\nIl peut travailler pour une entreprise artisanale, une entreprise moyenne ou une grande entreprise, en atelier ou sur chantier, dans les secteurs de l\'industrie, des services, de l\'habitat et des \\u00e9quipements publics.\\nHabitat \\/ tertiaire : le professionnel intervient majoritairement sur les installations \\u00e9lectriques des maisons et bureaux (mat\\u00e9riel d\'\\u00e9clairage, de chauffage, mat\\u00e9riels utilisant des courants faibles pour les r\\u00e9seaux informatiques et de t\\u00e9l\\u00e9communications).\\nIndustriel : le professionnel intervient majoritairement sur les installations \\u00e9lectriques de haute tension et basse tension (transformateurs, machines\\n- outils, moteurs \\u00e9lectriques...).\\nExemple(s) de m\\u00e9tier(s):\\nascensoriste\\nchef de chantier en installations \\u00e9lectriques\\n\\u00e9lectricien(ne) installateur(trice)\\n\\u00e9lectrom\\u00e9canicien(ne)\\ninstallateur(trice) en t\\u00e9l\\u00e9coms\\nmonteur(euse)-c\\u00e2bleur(euse)\\ntechnicien(ne) de maintenance industrielle\\ntechnicien(ne) d\'intervention client\\u00e8le gaz\\nLe bac pro a pour premier objectif l\'insertion professionnelle mais, avec un tr\\u00e8s bon dossier ou une mention \\u00e0 l\'examen, une poursuite d\'\\u00e9tudes est envisageable en BTS. Une sp\\u00e9cialisation est possible en MC ou FCIL.\\nPoursuite d\'\\u00e9tudes conditionnelle\\nExemples de formations poursuivies :\\nTechnicien de maintenance des ascenseurs\\nTechnicien de r\\u00e9paration des ascenseurs\\nMC Technicien(ne) ascensoriste (service et modernisation)\\nMC Technicien(ne) en r\\u00e9seaux \\u00e9lectriques\\nBTS Assistance technique d\'ing\\u00e9nieur\\nBTS Conception et r\\u00e9alisation de syst\\u00e8mes automatiques\\nBTS Contr\\u00f4le industriel et r\\u00e9gulation automatique\\nBTS Domotique\\nBTS Electrotechnique\\nBTS Fluides, \\u00e9nergies, environnements option C g\\u00e9nie frigorifique\\nBTS Maintenance industrielle\\n[...]"},"description":{"a":{"display":"body","type":"text"},"c":"Cette certification est compos\\u00e9e de :\\n-  UE 1. \\u00c9preuve scientifique\\n-  UE 1.1 Math\\u00e9matiques\\n-  UE 1.2 Sciences physiques et chimiques\\n-  UE 2. \\u00c9tude d\'un ouvrage\\n-  UE 3. \\u00c9preuve pratique prenant en compte l\'activit\\u00e9 professionnelle\\n-  UE 3.1 Situations de travail sp\\u00e9cifi\\u00e9es et r\\u00e9alis\\u00e9es en milieu professionnel\\n-  UE 3.2 Mise en service d\'un ouvrage\\n-  UE 3.3 Maintenance d\'un ouvrage\\n-  UE 3.4 R\\u00e9glage, param\\u00e9trage, contr\\u00f4le, modification li\\u00e9s au champ d\'application\\n-  UE 3.5 \\u00c9conomie\\n- gestion\\n-  UE 3.6 Pr\\u00e9vention\\n- sant\\u00e9-environnement\\n-  UE 4. \\u00c9preuve de langue vivante \\u00e9trang\\u00e8re\\n-  UE 5. Fran\\u00e7ais, histoire\\n- g\\u00e9ographie, \\u00e9ducation civique\\n-  UE 5.1 Fran\\u00e7ais\\n-  UE 5.2 Histoire\\n- g\\u00e9ographie et \\u00e9ducation civique\\n-  UE 6. Arts appliqu\\u00e9s et cultures artistiques\\n-  UE 7. \\u00c9ducation physique et sportive\\n-  Ufac 1. Epreuve facultative de langue des signes fran\\u00e7aise (LSF)\\nhttp:\\/\\/www2.cndp.fr\\/archivage\\/valid\\/brochadmin\\/bouton\\/a042.htm\\nPartenariat(s) :\\nDes entreprises de Mayotte"},"sanction":{"a":{"display":"body","type":"text"},"c":"obtention du Bac pro \\u00e9lectrotechnique, \\u00e9nergie, \\u00e9quipements communicants - habitat tertiaire"},"validation":{"a":{"display":"body","type":"text"},"c":"1"},"modens":{"a":{"display":"none","type":"text"},"c":"0"},"condspec":{"a":{"display":"condition","type":"text"},"c":"jeune de moins de 26 ans"}}	-12.822095	45.130634	/1/1/27/5/34/	\\N	97670	\\N		5	[niv:5]';
const expectedFormationObject = {
    'meta': {
        'idLBF': 1,
        'creationDateInLBf': new Date('2016-04-01T12:09:11.000Z'),
        'updateDateInLBf': new Date('2016-11-03T11:41:12.000Z'),
        'deletionDateInLBf': new Date('2018-05-14T05:14:35.000Z')
    },
    'intitule': 'Bac pro électrotechnique, énergie, équipements communicants. - Option : habitat /Tertiaire',
    'domaine': {
        'formacode': ['24396', '11001', '22499', '24054'],
        'codeROME': ['F1602', 'H1504', 'I1301', 'I1307', 'I1309']
    },
    'flags': {
        'conventionnee': false,
        'entreeSortiePermanente': false,
        'aDistance': false,
        'diplomante': false,
        'certifiante': false,
        'contratApprentissage': false,
        'contratProfessionnalisation': false
    },
    'status': 'INACTIVE',
    'intercarif': { 'id': '39_1', 'idOrganisation': '39_1' },
    'dates': { 'start': null, 'end': null },
    'codeFinanceur': [],
    'niveauSortie': 5,
    'location': {
        'coord': { 'type': 'Point', 'coordinates': [-12.822095, 45.130634] },
        'zipCode': '97670',
        'locationPath': '/1/1/27/5/34/',
        'locationSearch': null
    }
};

const sessionLine = '231515	2017-09-23 13:35:40	\\N	\\N	ACTIVE	\\N	801	07_16719	\\N	2017-09-15 00:00:00	2017-09-26 00:00:00	/1/1/12/2/322/	48.443854	1.489012';
const expectedSessionObject = {
    'meta': {
        'idLBF': 231515,
        'creationDateInLBf': new Date('2017-09-23T11:35:40.000Z'),
        'updateDateInLBf': null,
        'deletionDateInLBf': null
    },
    'status': 'ACTIVE',
    'actionIdLBF': null,
    'fomationIdLBF': 801,
    'intercarif': { 'id': '07_16719', 'idFormation': null },
    'dates': { 'start': new Date('2017-09-14T22:00:00.000Z'), 'end': new Date('2017-09-25T22:00:00.000Z') },
    'location': { 'coord': { 'type': 'Point', 'coordinates': [48.443854, 1.489012] }, 'locationPath': '/1/1/12/2/322/' }
};

const organismeLine = '3772	2016-04-01 14:26:25	\\N	\\N	ACTIVE	26_4035	APLOMB	{"line":{"a":{"type":"text","display":"address"},"c":"APLOMB\\n9 rue du Colombier\\nMaison des associations\\n"},"city":{"a":{"type":"text","display":"address"},"c":"38160, Saint-Marcellin"},"zipcode":{"a":{"type":"text"},"c":"38160"},"codeinsee":{"a":{"type":"text"},"c":"38416"},"lat":{"a":{"type":"float"},"c":45.1490511},"lng":{"a":{"type":"float"},"c":5.3211448},"orgaid":{"a":{"type":"text"},"c":"26_4035"},"organame":{"a":{"type":"text"},"c":"APLOMB"},"raison":{"a":{"type":"text","display":"law"},"c":"APLOMB"},"siret":{"a":{"type":"text","display":"law"},"c":"51151101600038"},"numacti":{"a":{"type":"text","display":"law"},"c":"82380480338"},"tel":{"a":{"type":"tel","display":"contact"},"c":"04 76 64 36 47"},"mobile":{"a":{"type":"tel","display":"contact"},"c":"06 80 77 85 02"},"email":{"a":{"type":"email","display":"contact"},"c":"asso.aplomb38@gmail.com"},"url":{"a":{"type":"url","display":"contact"},"c":"http:\\/\\/www.aplomb.saintmarcellin-vercors-isere.fr"}}	\\N	\\N	\\N';
const expectedOrganismeObject = {
    'meta': {
        'idLBF': 3772,
        'creationDateInLBf': new Date('2016-04-01T12:26:25.000Z'),
        'updateDateInLBf': null,
        'deletionDateInLBf': null
    },
    'status': 'ACTIVE',
    'intercarif': { 'id': '26_4035' },
    'raisonSociale': 'APLOMB',
    'SIRET': '51151101600038',
    'courriel': 'asso.aplomb38@gmail.com',
    'adresse': {
        'line': 'APLOMB\\n9 rue du Colombier\\nMaison des associations\\n',
        'zipCode': '38160',
        'city': '38160, Saint-Marcellin'
    },
    'needMailSend': true
};

const badFormationLine = '1	1	2016-04-01 14:09:11	2016-11-03 12:41:12	2018-05-14 07:14:35	INACTIVE	0	1	\\N	\\N	0	39_1	39_1	24396 11001 22499 24054	F1602 H1504 I1301 I1307 I1309	Bac pro électrotechnique, énergie, équipements communicants. - Option : habitat /Tertiaire		{"line":{"a":{"type":"text","display":"address"},"c":"Lyc\\u00e9e polyvalent Kahani\\n"},"city":{"a":{"type":"text","display":"address"},"c":"97670, COCONI"},"zipcode":{"a":{"type":"text"},"c":"97670"},"codeinsee":{"a":{"type":"text"},"c":"98518"},"lat":{"a":{"type":"float"},"c":"-12.822095"},"lng":{"a":{"type":"float"},"c":"45.130634"},"tel":{"a":{"type":"tel","display":"contact"},"c":"02 69 62 09 09"},"fax":{"a":{"type":"tel","display":"contact"},"c":"02 69 62 85 10"},"email":{"a":{"type":"email","display":"contact"},"c":"lpo.kahani@ac-mayotte.fr"},"url":{"a":{"type":"url","display":"contact"},"c":"http:\\/\\/sites.ac-mayotte.fr\\/lyckahani\\/"},"session":{"a":{"display":"none","type":"date"},"c":[{"beganat":"2014-08-26","endedat":"2017-06-30"},{"beganat":"2015-08-22","endedat":"2018-06-30"},{"beganat":"2016-08-25","endedat":"2019-07-05"}]},"rncp":{"a":{"display":"none","type":"text","title":"RNCP"},"c":"427"},"objective":{"a":{"display":"body","type":"text"},"c":"Cette formation peut \\u00eatre dispens\\u00e9e selon les \\u00e9tablissements avec une ou plusieurs des sp\\u00e9cialit\\u00e9s suivantes :\\nHabitat tertiaire\\nIndustriel\\nPossibilit\\u00e9 de convention avec la Marine nationale\\nPossibilit\\u00e9 de convention avec l\'Arm\\u00e9e de terre\\nLe titulaire de ce dipl\\u00f4me intervient dans la production, le transport, la distribution et la transformation de l\'\\u00e9nergie \\u00e9lectrique. Il est charg\\u00e9 de la r\\u00e9alisation, de la mise en service et de la maintenance des installations \\u00e9lectriques et des r\\u00e9seaux, de l\'organisation et de la planification des chantiers. Du fait de l\'\\u00e9volution des techniques et des technologies, il intervient \\u00e9galement sur les r\\u00e9seaux et \\u00e9quipements destin\\u00e9s \\u00e0 transmettre et \\u00e0 traiter la voix ou sur ceux li\\u00e9s \\u00e0 la s\\u00e9curit\\u00e9 des personnes et des biens.\\nIl peut travailler pour une entreprise artisanale, une entreprise moyenne ou une grande entreprise, en atelier ou sur chantier, dans les secteurs de l\'industrie, des services, de l\'habitat et des \\u00e9quipements publics.\\nHabitat \\/ tertiaire : le professionnel intervient majoritairement sur les installations \\u00e9lectriques des maisons et bureaux (mat\\u00e9riel d\'\\u00e9clairage, de chauffage, mat\\u00e9riels utilisant des courants faibles pour les r\\u00e9seaux informatiques et de t\\u00e9l\\u00e9communications).\\nIndustriel : le professionnel intervient majoritairement sur les installations \\u00e9lectriques de haute tension et basse tension (transformateurs, machines\\n- outils, moteurs \\u00e9lectriques...).\\nExemple(s) de m\\u00e9tier(s):\\nascensoriste\\nchef de chantier en installations \\u00e9lectriques\\n\\u00e9lectricien(ne) installateur(trice)\\n\\u00e9lectrom\\u00e9canicien(ne)\\ninstallateur(trice) en t\\u00e9l\\u00e9coms\\nmonteur(euse)-c\\u00e2bleur(euse)\\ntechnicien(ne) de maintenance industrielle\\ntechnicien(ne) d\'intervention client\\u00e8le gaz\\nLe bac pro a pour premier objectif l\'insertion professionnelle mais, avec un tr\\u00e8s bon dossier ou une mention \\u00e0 l\'examen, une poursuite d\'\\u00e9tudes est envisageable en BTS. Une sp\\u00e9cialisation est possible en MC ou FCIL.\\nPoursuite d\'\\u00e9tudes conditionnelle\\nExemples de formations poursuivies :\\nTechnicien de maintenance des ascenseurs\\nTechnicien de r\\u00e9paration des ascenseurs\\nMC Technicien(ne) ascensoriste (service et modernisation)\\nMC Technicien(ne) en r\\u00e9seaux \\u00e9lectriques\\nBTS Assistance technique d\'ing\\u00e9nieur\\nBTS Conception et r\\u00e9alisation de syst\\u00e8mes automatiques\\nBTS Contr\\u00f4le industriel et r\\u00e9gulation automatique\\nBTS Domotique\\nBTS Electrotechnique\\nBTS Fluides, \\u00e9nergies, environnements option C g\\u00e9nie frigorifique\\nBTS Maintenance industrielle\\n[...]"},"description":{"a":{"display":"body","type":"text"},"c":"Cette certification est compos\\u00e9e de :\\n-  UE 1. \\u00c9preuve scientifique\\n-  UE 1.1 Math\\u00e9matiques\\n-  UE 1.2 Sciences physiques et chimiques\\n-  UE 2. \\u00c9tude d\'un ouvrage\\n-  UE 3. \\u00c9preuve pratique prenant en compte l\'activit\\u00e9 professionnelle\\n-  UE 3.1 Situations de travail sp\\u00e9cifi\\u00e9es et r\\u00e9alis\\u00e9es en milieu professionnel\\n-  UE 3.2 Mise en service d\'un ouvrage\\n-  UE 3.3 Maintenance d\'un ouvrage\\n-  UE 3.4 R\\u00e9glage, param\\u00e9trage, contr\\u00f4le, modification li\\u00e9s au champ d\'application\\n-  UE 3.5 \\u00c9conomie\\n- gestion\\n-  UE 3.6 Pr\\u00e9vention\\n- sant\\u00e9-environnement\\n-  UE 4. \\u00c9preuve de langue vivante \\u00e9trang\\u00e8re\\n-  UE 5. Fran\\u00e7ais, histoire\\n- g\\u00e9ographie, \\u00e9ducation civique\\n-  UE 5.1 Fran\\u00e7ais\\n-  UE 5.2 Histoire\\n- g\\u00e9ographie et \\u00e9ducation civique\\n-  UE 6. Arts appliqu\\u00e9s et cultures artistiques\\n-  UE 7. \\u00c9ducation physique et sportive\\n-  Ufac 1. Epreuve facultative de langue des signes fran\\u00e7aise (LSF)\\nhttp:\\/\\/www2.cndp.fr\\/archivage\\/valid\\/brochadmin\\/bouton\\/a042.htm\\nPartenariat(s) :\\nDes entreprises de Mayotte"},"sanction":{"a":{"display":"body","type":"text"},"c":"obtention du Bac pro \\u00e9lectrotechnique, \\u00e9nergie, \\u00e9quipements communicants - habitat tertiaire"},"validation":{"a":{"display":"body","type":"text"},"c":"1"},"modens":{"a":{"display":"none","type":"text"},"c":"0"},"condspec":{"a":{"display":"condition","type":"text"},"c":"jeune de moins de 26 ans"}}	-12.822095	45.130634	/1/1/27/5/34/	\\N	97670	\\N		5	[niv:5]';
const badSessionLine = '1	231515	2017-09-23 13:35:40	\\N	\\N	ACTIVE	\\N	801	07_16719	\\N	2017-09-15 00:00:00	2017-09-26 00:00:00	/1/1/12/2/322/	48.443854	1.489012';
const badOrganismeLine = '1	3772	2016-04-01 14:26:25	\\N	\\N	ACTIVE	26_4035	APLOMB	{"line":{"a":{"type":"text","display":"address"},"c":"APLOMB\\n9 rue du Colombier\\nMaison des associations\\n"},"city":{"a":{"type":"text","display":"address"},"c":"38160, Saint-Marcellin"},"zipcode":{"a":{"type":"text"},"c":"38160"},"codeinsee":{"a":{"type":"text"},"c":"38416"},"lat":{"a":{"type":"float"},"c":45.1490511},"lng":{"a":{"type":"float"},"c":5.3211448},"orgaid":{"a":{"type":"text"},"c":"26_4035"},"organame":{"a":{"type":"text"},"c":"APLOMB"},"raison":{"a":{"type":"text","display":"law"},"c":"APLOMB"},"siret":{"a":{"type":"text","display":"law"},"c":"51151101600038"},"numacti":{"a":{"type":"text","display":"law"},"c":"82380480338"},"tel":{"a":{"type":"tel","display":"contact"},"c":"04 76 64 36 47"},"mobile":{"a":{"type":"tel","display":"contact"},"c":"06 80 77 85 02"},"email":{"a":{"type":"email","display":"contact"},"c":"asso.aplomb38@gmail.com"},"url":{"a":{"type":"url","display":"contact"},"c":"http:\\/\\/www.aplomb.saintmarcellin-vercors-isere.fr"}}	\\N	\\N	\\N';

const oldOrganisme = {
    'meta': {
        'idLBF': 3,
        'creationDateInLBf': new Date('2016-04-01T12:26:04Z'),
        'updateDateInLBf': null,
        'deletionDateInLBf': null,
        'importDate': new Date('2018-06-11T10:21:45.886Z')
    },
    'status': 'ACTIVE',
    'intercarif': { 'id': '39_91' },
    'raisonSociale': '�cole d\'Apprentissage Maritime de Mayotte (AFODEMAM)',
    'SIRET': '47915025200019',
    'courriel': 'eam@eam2.fr',
    'adresse': { 'line': 'AFODEMAM\\\\nplace de France\\\\n', 'zipCode': '97610', 'city': '97610, Dzaoudzi' },
    'token': '1144b7f3-ee9c-4319-9ae4-89ded3c0b7e8',
    'needMailSend': false,
    'passwordHash': 'toto',
    'mailSentDate': new Date('2017-11-10T17:41:03.308Z'),
    'tracking.firstRead': new Date('2017-11-10T17:45:03.308Z'),
    'editedCourriel': 'monadresse@email.fr'
};
const newOrganisme = {
    'meta': {
        'idLBF': 3,
        'creationDateInLBf': new Date('2016-04-01T12:26:04Z'),
        'updateDateInLBf': null,
        'deletionDateInLBf': null,
        'importDate': new Date('2018-06-11T10:21:45.886Z')
    },
    'status': 'ACTIVE',
    'intercarif': { 'id': '39_91' },
    'raisonSociale': '�cole d\'Apprentissage Maritime de Mayotte (AFODEMAM)',
    'SIRET': '47915025200019',
    'courriel': 'nouvelleadresse@eam2.fr',
    'adresse': { 'line': 'Nouvelle adresse', 'zipCode': '97610', 'city': '97610, Dzaoudzi' }
};

const UUIDRegExp = RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'g');
const SIRETRegExp = RegExp('^[0-9]{14}$', 'g');

describe('LBF catalog', function() {
    describe('buildFormation', function() {
        it('should build a well formed \'formation\'', function() {
            let obj = buildFormation(formationLine.split('\t'));
            assert.deepEqual(['ACTIVE', 'INACTIVE', 'DELETED'].includes(obj.status), true);
            delete obj.meta.importDate;
            assert.deepEqual(obj, expectedFormationObject);
        });
        it('should throw an exception if TSV line length does not match expected length', function() {
            assert.throws(
                () => {
                    buildFormation(badFormationLine.split('\t'));
                },
                Error
            );
        });
    });
    describe('buildSession', function() {
        it('should build a well formed \'session\'', function() {
            let obj = buildSession(sessionLine.split('\t'));
            assert.deepEqual(['ACTIVE', 'INACTIVE', 'DELETED'].includes(obj.status), true);
            delete obj.meta.importDate;
            assert.deepEqual(obj, expectedSessionObject);
        });
        it('should throw an exception if TSV line length does not match expected length', function() {
            assert.throws(
                () => {
                    buildFormation(badSessionLine.split('\t'));
                },
                Error
            );
        });
    });
    describe('buildOrganisme', function() {
        it('should build a well formed \'organisme\'', function() {
            let obj = buildOrganisme(organismeLine.split('\t'));
            assert.deepEqual(['ACTIVE', 'INACTIVE', 'DELETED'].includes(obj.status), true);
            assert.deepEqual(UUIDRegExp.test(obj.token), true);
            assert.deepEqual(SIRETRegExp.test(obj.SIRET), true);
            delete obj.token;
            delete obj.meta.importDate;
            assert.deepEqual(obj, expectedOrganismeObject);
        });
        it('should throw an exception if TSV line length does not match expected length', function() {
            assert.throws(
                () => {
                    buildFormation(badOrganismeLine.split('\t'));
                },
                Error
            );
        });
    });
    describe('updateOrganisme', function() {
        it('should keep existing values and add new one', function() {
            let orga = updateOrganisme(oldOrganisme, newOrganisme);
            assert.deepEqual(orga.meta.idLBF, oldOrganisme.meta.idLBF);
            assert.deepEqual(orga.meta.creationDateInLBf, oldOrganisme.meta.creationDateInLBf);
            assert.equal(orga.meta.updateDate === undefined, false);
            assert.deepEqual(orga.SIRET, oldOrganisme.SIRET);
            assert.deepEqual(orga.token, oldOrganisme.token);
            assert.deepEqual(orga.editedCourriel, oldOrganisme.editedCourriel);
            assert.deepEqual(orga.passwordHash, oldOrganisme.passwordHash);
            assert.deepEqual(orga.tracking, oldOrganisme.tracking);
            assert.deepEqual(orga.courriel, newOrganisme.courriel);
            assert.deepEqual(orga.adresse, newOrganisme.adresse);
        });
    });
});

