import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ChampCommentaire.scss';

class ChampCommentaire extends Component {

    static propTypes = {
        titre: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired
    };

    render() {
        return (
            <div className="champ-commentaire">
                <span className={`title_${this.props.name}`}><strong>{this.props.titre}</strong> (optionnel)</span>
                <textarea className={`textarea_${this.props.name}`} type="text" placeholder={this.props.placeholder} name={this.props.name} onChange={this.props.onChange} />
            </div>
        );
    }
}

export default ChampCommentaire;
