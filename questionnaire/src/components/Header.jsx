import React, { Component } from 'react';

import PropTypes from 'prop-types';

import moment from 'moment';

import './header.scss';

class Header extends Component {

    static propTypes = {
        stagiaire: PropTypes.object
    };

    render() {
        return (
            <div className="header">
                {this.props.stagiaire &&
                <div>
                    <img className="logo" src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="logo Anotéa" />
                    <h1>Notez et commentez votre formation</h1>
                    <h2>
                        <strong>{this.props.stagiaire.training.title}</strong> | {moment(this.props.stagiaire.training.startDate).format('DD/MM/YYYY')} au {moment(this.props.stagiaire.training.scheduledEndDate).format('DD/MM/YYYY')}
                        <p>
                            <span>{this.props.stagiaire.training.organisation.name}</span> - <span>{this.props.stagiaire.training.place.city}</span>
                        </p>
                    </h2>
                </div>
                }
            </div>
        );
    }
}

export default Header;
