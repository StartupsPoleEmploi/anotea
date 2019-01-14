#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');
const createIndexes = require('../indexes/createIndexes');

execute(async ({ db }) => {

    let regions = db.collection('regions');

    await regions.remove({});

    await Promise.all([
        regions.insertOne({ codeINSEE: '2', codeRegion: '13', nom: 'Martinique' }),
        regions.insertOne({ codeINSEE: '3', codeRegion: '9', nom: 'Guyane' }),
        regions.insertOne({ codeINSEE: '4', codeRegion: '12', nom: 'La Réunion' }),
        regions.insertOne({ codeINSEE: '6', codeRegion: '12', nom: 'Mayotte' }),
        regions.insertOne({ codeINSEE: '11', codeRegion: '11', nom: 'Île-de-France' }),
        regions.insertOne({ codeINSEE: '24', codeRegion: '5', nom: 'Centre-Val de Loire' }),
        regions.insertOne({ codeINSEE: '27', codeRegion: '3', nom: 'Bourgogne-Franche-Comté' }),
        regions.insertOne({ codeINSEE: '28', codeRegion: '14', nom: 'Normandie' }),
        regions.insertOne({ codeINSEE: '32', codeRegion: '10', nom: 'Hauts-de-France' }),
        regions.insertOne({ codeINSEE: '52', codeRegion: '17', nom: 'Pays de la Loire' }),
        regions.insertOne({ codeINSEE: '53', codeRegion: '4', nom: 'Bretagne' }),
        regions.insertOne({ codeINSEE: '75', codeRegion: '15', nom: 'Nouvelle-Aquitaine' }),
        regions.insertOne({ codeINSEE: '84', codeRegion: '2', nom: 'Auvergne-Rhône-Alpes' }),
        regions.insertOne({ codeINSEE: '93', codeRegion: '18', nom: 'Provence-Alpes-Côte d\'Azur' }),
        regions.insertOne({ codeINSEE: '94', codeRegion: '6', nom: 'Corse' }),
        regions.insertOne({ codeINSEE: '76', codeRegion: '16', nom: 'Occitanie' }),
        regions.insertOne({ codeINSEE: '44', codeRegion: '7', nom: 'Grand-Est' }),
    ]);

    return createIndexes(db);
});
