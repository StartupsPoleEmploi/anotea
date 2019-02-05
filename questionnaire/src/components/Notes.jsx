import React, { Component } from 'react';

import './notes.scss';

import Note from './Note';
import NoteMoyenne from './NoteMoyenne';

const items = [{
    title: 'Accueil',
    description: 'Réunions d\'information collective et entretiens à l\'entrée en formation.'
}, {
    title: 'Contenu de la formation',
    description: 'Programme, supports pédagogiques, organisation de modules, alternance théorie/pratique.'
}, {
    title: 'Équipe de formateurs',
    description: 'Prise en compte du besoin des stagiaires.'
}, {
    title: 'Moyens matériels mis à disposition',
    description: 'Salles de cours, documentation, plateaux techniques, équipement informatique.'
}, {
    title: 'Accompagnement',
    description: 'Aide à la recherche de stage/emploi, mise en relation et rencontre avec les entreprises.'
}];

class Notes extends Component {

    state = {
        averageScore: null,
        notes: []
    }

    constructor(props) {
        super(props);
        for (let i = 0; i <= 4; i++) {
            this.state.notes.push({ index: i, value: null });
        }
    }

    onSelect = (index, value) => {
        if (value !== null) {
            value++;
        }
        let total = null;
        let count = 0;
        let notes = this.state.notes.map(item => {
            if (item.index === index) {
                item.value = value;
            }
            if (item.value !== null) {
                total += item.value;
                count++;
            }
            return item;
        });
        let average = null;
        if (total !== null) {
            average = (parseFloat(total) / parseFloat(count));
        }
        this.setState({
            notes: notes,
            averageScore: average
        });
    }

    getItems = () => {
        return items.map((item, index) =>
            <Note key={index} index={index} title={item.title} description={item.description} parity={index % 2 === 0 ? 'even' : 'odd'} onSelect={this.onSelect} />
        );
    }

    render() {
        return (
            <div>
                <h3 className="notes">Notes</h3>
                <NoteMoyenne averageScore={this.state.averageScore} />
                {
                    this.getItems()
                }
            </div>
        );
    }
}

export default Notes;
