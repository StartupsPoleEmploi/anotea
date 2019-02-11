import React, { Component } from 'react';

import PropTypes from 'prop-types';

import moment from 'moment';

import './header.scss';

class Header extends Component {

    static propTypes = {
        trainee: PropTypes.object
    };

    render() {
        return (
            <div className="header">
                { this.props.trainee &&
                    <div>
                        <img className="logo" src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="logo Anotéa" />
                        <h1>Notez et commentez votre formation</h1>
                        <h2><strong>{this.props.trainee.training.title}</strong> | {moment(this.props.trainee.training.startDate).format('DD/MM/YYYY')} au  {moment(this.props.trainee.training.scheduledEndDate).format('DD/MM/YYYY')}
                            <p>{this.props.trainee.training.organisation.name} - {this.props.trainee.training.place.city}</p>
                        </h2>
                    </div>
                }
            </div>
        );
    }
}

export default Header;
