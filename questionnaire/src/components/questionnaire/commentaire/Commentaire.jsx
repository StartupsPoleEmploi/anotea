import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from './Textarea';
import './commentaire.scss';

class Commentaire extends Component {

    state = {
        titre: '',
        texte: '',
        pseudo: '',
        badwords: {
            titre: false,
            texte: false,
            pseudo: false
        }
    };

    static propTypes = {
        onChange: PropTypes.func.isRequired
    };

    onChange = (name, value, containsBadwords) => {
        let state = this.state;
        state[name] = value;
        state.badwords = Object.assign(this.state.badwords, { [name]: containsBadwords });
        this.setState(state);
        this.props.onChange({
            commentaire: { titre: state.titre, texte: state.texte },
            pseudo: state.pseudo
        }, state.badwords);
    };

    render() {
        return (
            <div className="commentaire">
                <h3>Commentaire <span className="description">(optionnel)</span></h3>
                <div className="frame">
                    <Textarea
                        name="texte"
                        titre="Votre commentaire"
                        placeholder="Dites nous ce que vous auriez aimé savoir avant de rentrer en formation. Restez courtois."
                        onChange={this.onChange} />
                    <Textarea
                        name="titre"
                        titre="Titre du commentaire"
                        placeholder="Le titre permet d’avoir un résumé de votre expérience de la formation."
                        onChange={this.onChange} />
                    <Textarea
                        titre="Pseudo"
                        placeholder="Choisissez votre pseudo afin de préserver votre anonymat."
                        name="pseudo"
                        onChange={this.onChange} />
                </div>
            </div>
        );
    }
}

export default Commentaire;
