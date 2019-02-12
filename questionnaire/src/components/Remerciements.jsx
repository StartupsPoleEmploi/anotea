import React, { Component } from 'react';

import PropTypes from 'prop-types';

import Header from './Header';
import Footer from './Footer';

import './remerciements.scss';
import PanelRemerciements from './PanelRemerciements';

class Remerciements extends Component {

    static propTypes = {
        trainee: PropTypes.object.isRequired,
        infosRegion: PropTypes.object.isRequired
    };

    render() {
        return (
            <div className="remerciements">
                { this.props.trainee &&
                    <div>
                        <Header trainee={this.props.trainee} />

                        <PanelRemerciements infosRegion={this.props.infosRegion} trainee={this.props.trainee} />

                        <Footer codeRegion={this.props.trainee.codeRegion} />
                    </div>
                }
            </div>
        );
    }
}

export default Remerciements;
