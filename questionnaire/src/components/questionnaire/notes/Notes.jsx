import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Note from './Note';
import items from '../../../data.json';
import NoteMoyenne from './NoteMoyenne';
import './notes.scss';

class Notes extends Component {

    state = {
        collapsed: false,
    };

    static propTypes = {
        notes: PropTypes.array.isRequired,
        averageScore: PropTypes.number.isRequired,
        onChange: PropTypes.func.isRequired,
        showErrorMessage: PropTypes.bool.isRequired
    };

    checkIfAllNotesAreValid = () => {
        let nbNotes = this.props.notes.reduce((acc, note) => {
            return acc + (note.value === null ? 0 : 1);
        }, 0);

        return nbNotes === 5;
    };

    isMissing = index => this.props.notes[index].value === null && this.props.showErrorMessage;

    showMoyenne = () => !this.props.notes.find(n => n.value === null);

    toggleCollapse = () => this.setState({ collapsed: !this.state.collapsed });

    updateNote = (index, value) => {
        if (value !== null) {
            value++;
        }

        let notes = this.props.notes.map(item => {
            if (item.index === index) {
                item.value = value;
            }
            return item;
        });

        this.props.onChange(notes, this.checkIfAllNotesAreValid());
        if (this.checkIfAllNotesAreValid()) {
            this.toggleCollapse();
        }
    };

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
                        <NoteMoyenne averageScore={this.props.averageScore} />
                    </div>
                </div>
                }

                {this.showMoyenne() &&
                <div className="row">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <div className="note-details py-2">
                            <span className="label">Détails des notes</span>
                            <div className="collapser">
                                <i
                                    className={`fas ${this.state.collapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}
                                    onClick={this.toggleCollapse} />
                            </div>
                        </div>
                    </div>
                </div>
                }

                {!this.state.collapsed &&
                <div className="row">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        {
                            items.map((item, index) =>
                                <div
                                    key={index}
                                    className={`note-container ${this.isMissing(index) ? 'missing' : ''}`}>
                                    {this.isMissing(index) && <i className="fas fa-times" />}
                                    <Note
                                        index={index}
                                        title={item.title}
                                        description={item.description}
                                        parity={index % 2 === 0 ? 'even' : 'odd'}
                                        value={this.props.notes[index] ? this.props.notes[index].value : 0}
                                        onSelect={this.updateNote} />
                                </div>
                            )
                        }
                    </div>
                </div>
                }
            </div>
        );
    }
}

export default Notes;
