import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Questionnaire from './pages/Questionnaire';
import Remerciements from './pages/Remerciements';
import Footer from './common/Footer';
import { getStagiaireInfo } from '../lib/stagiaireService';
import ErrorPage from './pages/ErrorPage';

export default class Funnel extends Component {

    static propTypes = {
        token: PropTypes.string.isRequired
    };

    state = {
        stagiaire: null,
        infosRegion: null,
        showRemerciements: false,
        showErrorPage: false,
    };

    fetchStagiaire = async token => {
        try {
            let response = await getStagiaireInfo(token);
            this.setState(response);
        } catch (ex) {
            console.error('An error occured', ex);
            this.setState({ showErrorPage: true });
        }
    };

    componentDidMount() {
        this.fetchStagiaire(this.props.token);
    }

    getCurrentPage() {

        if (this.state.showErrorPage) {
            return <ErrorPage />;
        }

        if (!this.state.stagiaire) {
            return (<div />);
        }
        return (
            this.state.showRemerciements ?
                <Remerciements stagiaire={this.state.stagiaire} infosRegion={this.state.infosRegion} /> :
                <Questionnaire
                    stagiaire={this.state.stagiaire}
                    onSubmit={() => this.setState({ showRemerciements: true })} />
        );
    }

    render() {
        let { stagiaire } = this.state;

        return (
            <div>
                {this.getCurrentPage()}
                <Footer stagiaire={stagiaire}>
                    {stagiaire &&
                    <img
                        className="logo-region"
                        src={`/img/regions/logo-questionnaire/region-${stagiaire.codeRegion}.png`}
                        alt="logo région" />
                    }

                </Footer>
            </div>
        );
    }
}
