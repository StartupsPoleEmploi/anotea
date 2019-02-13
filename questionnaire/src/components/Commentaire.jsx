import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './commentaire.scss';
import ChampCommentaire from './ChampCommentaire';

class Commentaire extends Component {

    state = {
        titre: '',
        commentaire: '',
        pseudo: ''
    }

    items = [
        {
            title: 'Votre commentaire',
            placeholder: 'Dites nous ce que vous auriez aimé savoir avant de rentrer en formation. Restez courtois.',
            name: 'commentaire',
        },
        {
            title: 'Titre du commentaire',
            placeholder: 'Le titre permet d’avoir un résumé de votre expérience de la formation.',
            name: 'titre'
        },
        {
            title: 'Pseudo',
            placeholder: 'Choisissez votre pseudo afin de préserver votre anonymat.',
            name: 'pseudo'
        },
    ]

    static propTypes = {
        onChange: PropTypes.func.isRequired
    };

    onChange = e => {
        let state = this.state;
        state[e.target.name] = e.target.value;
        this.setState(state);
        this.props.onChange({ commentaire: { titre: state.titre, texte: state.commentaire }, pseudo: state.pseudo });
    }

    getItems = () => {
        return this.items.map((item, index) =>
            <ChampCommentaire key={index} titre={item.title} placeholder={item.placeholder} name={item.name} onChange={this.onChange} />
        );
    }

    render() {
        return (
            <div className="commentaire">
                <h3>Commentaire <span className="description">(optionnel)</span></h3>
                <div className="frame">
                    {this.getItems()}
                </div>
            </div>
        );
    }
}

export default Commentaire;
