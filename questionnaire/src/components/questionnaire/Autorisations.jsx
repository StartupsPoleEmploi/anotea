import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Autorisations.scss';

class Autorisations extends Component {

    state = {
        accord: false,
        accordEntreprise: false,
    };

    static propTypes = {
        onChange: PropTypes.func.isRequired
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.checked }, () => {
            this.props.onChange({ accord: this.state.accord, accordEntreprise: this.state.accordEntreprise });
        });
    };

    render() {
        return (
            <div className="autorisations">
                <div className="row">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <div className="field">
                            <input
                                type="checkbox"
                                name="accordEntreprise"
                                className="input-accord"
                                onChange={this.onChange} />
                            <span>J&apos;autorise une entreprise à me <strong>contacter</strong>.</span>
                        </div>
                        <div className="field">
                            <input
                                type="checkbox"
                                name="accord"
                                className="input-accord"
                                onChange={this.onChange} />
                            <span>J&apos;autorise les futur(e)s stagiaires à me <strong>questionner</strong> sur cette formation.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Autorisations;
