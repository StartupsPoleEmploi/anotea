import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ChampCommentaire.scss';

const LIMIT = 200;

class ChampCommentaire extends Component {

    state = {
        value: ''
    }

    static propTypes = {
        titre: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onChange = event => {
        let value = event.target.value;
        if (value.length <= LIMIT) {
            this.setState({ value: value });
            this.props.onChange(event);
        }
    }

    render() {
        return (
            <div className="champ-commentaire">
                <span className={`title_${this.props.name}`}><strong>{this.props.titre}</strong> (optionnel)</span>
                <textarea className={`textarea_${this.props.name}`} type="text" placeholder={this.props.placeholder} name={this.props.name} value={this.state.value} onChange={this.onChange} />
                { this.state.value.length > 0 &&
                    <div className={this.state.value.length === LIMIT ? 'remaining no' : 'remaining yes'}>{LIMIT - this.state.value.length} caractères restant</div>
                }
            </div>
        );
    }
}

export default ChampCommentaire;
