import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { checkBadwords } from '../../../../lib/stagiaireService';
import Badwords from './Badwords';
import './commentaire.scss';

class Commentaire extends Component {

    static propTypes = {
        commentaire: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired
    };

    state = {
        texte: '',
        titre: ''
    };

    constructor(props) {
        super(props);
        let createBadwordsDebouncer = name => {
            return _.debounce(value => {
                checkBadwords(value)
                .then(() => this.props.onChange(name, value, true))
                .catch(() => this.props.onChange(name, value, false));

            }, 1000);
        };

        this.badwordValidators = {
            texte: createBadwordsDebouncer('texte'),
            titre: createBadwordsDebouncer('titre'),
        };
    }

    onChange = async event => {
        const { name, value, maxLength } = event.target;
        if (value.length <= maxLength) {
            this.setState({ [name]: value }, () => {
                return this.badwordValidators[name](value);
            });
        }
    };

    onBlur = async event => {
        const { name } = event.target;
        this.badwordValidators[name].flush();
    };

    render() {

        let { commentaire } = this.props;
        return (
            <div className="commentaire">

                <div className="row">
                    <div className="col-sm-12 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
                        <div className="row inner-row field">
                            <div className="col-sm-12">
                                <h3>Commentaire</h3>
                                <textarea
                                    name="texte"
                                    value={this.state.texte}
                                    maxLength={200}
                                    rows="5"
                                    className={`${!commentaire.texte.isValid ? 'badwords' : ''}`}
                                    placeholder="Partagez votre expérience pour éclairer les futurs stagiaires."
                                    onBlur={this.onBlur}
                                    onChange={this.onChange} />
                                {!commentaire.texte.isValid && <Badwords />}
                                <div className="chars-count">Il vous reste {200 - this.state.texte.length} caractères.</div>
                            </div>
                        </div>
                        <div className="row inner-row field">
                            <div className="col-sm-12">
                                <h3>Titre du commentaire*</h3>
                                <input
                                    type="text"
                                    name="titre"
                                    value={this.state.titre}
                                    maxLength={50}
                                    className={`${!commentaire.titre.isValid ? 'badwords' : ''}`}
                                    placeholder="Le titre permet d’avoir un résumé de votre expérience de la formation."
                                    onBlur={this.onBlur}
                                    onChange={this.onChange} />
                                {!commentaire.titre.isValid && <Badwords />}
                                <div className="chars-count">Il vous reste {50 - this.state.titre.length} caractères.</div>
                            </div>
                        </div>
                        <div className="row inner-row field">
                            <div className="col-sm-12 facultatif">
                                * facultatif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Commentaire;
