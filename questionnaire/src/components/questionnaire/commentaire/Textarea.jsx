import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { checkBadwords } from '../../../lib/stagiaireService';
import './Textarea.scss';

const LIMIT = 200;

export default class Textarea extends Component {

    state = {
        value: '',
        badwords: false
    };

    static propTypes = {
        titre: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onChange = async event => {
        let name = event.target.name;
        let value = event.target.value;
        if (value.length <= LIMIT) {
            this.setState({ value: value });
        }

        let sentence = await checkBadwords(value);
        if (sentence.isGood) {
            this.setState({ badwords: false });
        } else {
            this.setState({ badwords: true });
        }
        this.props.onChange(name, value, !sentence.isGood);
    };

    render() {
        return (
            <div className="champ-commentaire">
                <span className={`title_${this.props.name}`}><strong>{this.props.titre}</strong> (optionnel)</span>
                <div className="textarea-container">
                    <textarea
                        rows="3"
                        className={`textarea_${this.props.name} ${this.state.badwords ? 'badwords' : ''}`}
                        placeholder={this.props.placeholder}
                        name={this.props.name}
                        value={this.state.value}
                        onChange={this.onChange} />
                </div>
                {this.state.value.length > 0 &&
                <div className={this.state.value.length === LIMIT ? 'remaining no' : 'remaining yes'}>
                    {LIMIT - this.state.value.length} caractères restant
                </div>
                }
                {this.state.badwords &&
                <div className="alert badwords">
                    Votre commentaire comporte une ou plusieurs injures, <strong>veuillez corriger votre
                    commentaire</strong>.
                </div>
                }
            </div>
        );
    }
}
