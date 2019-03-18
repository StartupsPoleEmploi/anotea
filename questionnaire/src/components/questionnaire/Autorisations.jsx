import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Autorisations.scss';

class Autorisations extends Component {

    state = {
        accord: false,
        accordEntreprise: false,
        items: [
            {
                id: 1,
                name: 'accordEntreprise',
                description: <span>J'autorise une entreprise à me <strong>contacter</strong>.</span>
            },
            {
                id: 2,
                name: 'accord',
                description: <span>J'autorise les futur(e)s stagiaires à me <strong>questionner</strong> sur cette formation.</span>
            },
        ]
    }

    static propTypes = {
        onChange: PropTypes.func.isRequired
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.checked }, () => {
            this.props.onChange({ accord: this.state.accord, accordEntreprise: this.state.accordEntreprise });
        });
    }

    render() {
        return (
            <div className="autorisations">
                {this.state.items.map((item, index) =>
                    <div className={`item${item.id}`} key={index}>
                        <input type="checkbox" name={item.name} className="input-accord" onChange={this.onChange} />
                        {item.description}
                    </div>
                )}
            </div>
        );
    }
}

export default Autorisations;
