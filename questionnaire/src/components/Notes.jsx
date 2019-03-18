import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './notes.scss';

import Note from './common/Note';
import NoteMoyenne from './NoteMoyenne';
import FoldButton from './common/FoldButton';

import items from '../data.json';

class Notes extends Component {

    state = {
        averageScore: null,
        notes: [],
        folded: false
    }

    constructor(props) {
        super(props);
        for (let i = 0; i <= 4; i++) {
            this.state.notes.push({ index: i, value: null });
        }
    }

    static propTypes = {
        setValid: PropTypes.func.isRequired,
        clicked: PropTypes.bool.isRequired
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

        let countNotes = this.state.notes.reduce((accumulator, note) => {
            return accumulator + (note.value === null ? 0 : 1);
        }, 0);

        this.props.setValid(countNotes === 5, average, this.state.notes);
        if (countNotes === 5) {
            this.fold();
        }
    }

    isMissing = index => this.state.notes[index].value === null && this.props.clicked;

    getItems = () => {
        return items.map((item, index) =>
            <div key={index} className={`note-container ${this.isMissing(index) ? 'missing' : ''}`}>
                <i className="fas fa-times"></i>
                <Note index={index} title={item.title} description={item.description}
                      parity={index % 2 === 0 ? 'even' : 'odd'}
                      value={this.state.notes[index] ? this.state.notes[index].value : 0} onSelect={this.onSelect} />
            </div>
        );
    }


    fold = () => this.setState({ folded: true });

    unfold = () => this.setState({ folded: false });

    render() {
        return (
            <div className="notes">
                <h3>Notes</h3>
                <NoteMoyenne averageScore={this.state.averageScore} />
                <div className="note-details">
                    <span className="label">Détails des notes</span>
                    <FoldButton onFold={this.fold} onUnfold={this.unfold} folded={this.state.folded} />
                </div>
                {!this.state.folded &&
                this.getItems()
                }
            </div>
        );
    }
}

export default Notes;
