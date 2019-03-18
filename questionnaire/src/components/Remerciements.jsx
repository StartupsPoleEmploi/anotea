import React, { Component } from 'react';

import PropTypes from 'prop-types';

import Header from './common/Header';
import Footer from './common/Footer';

import './remerciements.scss';
import PanelRemerciements from './PanelRemerciements';

class Remerciements extends Component {

    static propTypes = {
        stagiaire: PropTypes.object.isRequired,
        infosRegion: PropTypes.object.isRequired
    };

    render() {
        return (
            <div className="remerciements">
                {this.props.stagiaire &&
                <div>
                    <Header stagiaire={this.props.stagiaire} />

                    <PanelRemerciements infosRegion={this.props.infosRegion} stagiaire={this.props.stagiaire} />

                    <Footer codeRegion={this.props.stagiaire.codeRegion} />
                </div>
                }
            </div>
        );
    }
}

export default Remerciements;
