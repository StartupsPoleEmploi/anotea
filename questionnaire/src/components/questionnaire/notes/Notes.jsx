import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Note from './Note';
import FoldButton from './FoldButton';
import items from '../../../data.json';
import NoteMoyenne from './NoteMoyenne';
import './notes.scss';

class Notes extends Component {

    state = {
        averageScore: null,
        folded: false,
        notes: [
            { index: 0, value: null },
            { index: 1, value: null },
            { index: 2, value: null },
            { index: 3, value: null },
            { index: 4, value: null },
        ],
    };

    static propTypes = {
        setValid: PropTypes.func.isRequired,
        clicked: PropTypes.bool.isRequired
    };

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
    };

    isMissing = index => this.state.notes[index].value === null && this.props.clicked;

    showMoyenne = () => !this.state.notes.find(n => n.value === null);

    renderAllNotes = () => {
        return items.map((item, index) =>
            <div
                key={index}
                className={`note-container ${this.isMissing(index) ? 'missing' : ''}`}>
                {this.isMissing(index) && <i className="fas fa-times" />}
                <Note
                    index={index}
                    title={item.title}
                    description={item.description}
                    parity={index % 2 === 0 ? 'even' : 'odd'}
                    value={this.state.notes[index] ? this.state.notes[index].value : 0}
                    onSelect={this.onSelect} />
            </div>
        );
    };

    fold = () => this.setState({ folded: true });

    unfold = () => this.setState({ folded: false });

    render() {
        return (
            <div className="notes">
                <div className="row">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <h3>Notes</h3>
                    </div>
                </div>

                {this.showMoyenne() &&
                <div className="row">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <NoteMoyenne averageScore={this.state.averageScore} />
                    </div>
                </div>
                }

                {this.showMoyenne() &&
                <div className="row">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <div className="note-details py-2">
                            <span className="label">Détails des notes</span>
                            <FoldButton onFold={this.fold} onUnfold={this.unfold} folded={this.state.folded} />
                        </div>
                    </div>
                </div>
                }

                {!this.state.folded &&
                <div className="row" key="O">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        {this.renderAllNotes()}
                    </div>
                </div>
                }
            </div>
        );
    }
}

export default Notes;
