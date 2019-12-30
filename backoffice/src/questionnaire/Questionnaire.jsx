import React, { Component } from 'react';
import { getStagiaireInfo } from './services/stagiaireService';
import { getTokenFromUrl } from './utils/token';
import Formulaire from './components/Formulaire';
import Remerciements from './components/Remerciements';
import ErrorPage from './components/ErrorPage';
import Footer from './components/Footer';
import './Questionnaire.scss';

class Questionnaire extends Component {

    state = {
        stagiaire: null,
        infosRegion: null,
        showRemerciements: false,
        showErrorPage: false,
    };

    fetchStagiaire = async () => {
        try {
            let token = getTokenFromUrl();
            let data = await getStagiaireInfo(token);
            this.setState({
                stagiaire: data.stagiaire,
                infosRegion: data.infosRegion,
                showRemerciements: data.submitted,
            });
        } catch (err) {
            console.error('An error occured', err);
            this.setState({ showErrorPage: true });
        }
    };

    componentDidMount() {
        this.fetchStagiaire(this.state.token);
    }

    render() {
        let { stagiaire, infosRegion } = this.state;

        if (this.state.showErrorPage) {
            return <ErrorPage />;
        }

        if (!stagiaire) {
            //Not yet loaded
            return (<div />);
        }

        return (
            <div>
                {this.state.showRemerciements ?
                    <Remerciements stagiaire={stagiaire} infosRegion={infosRegion} /> :
                    <Formulaire
                        stagiaire={stagiaire}
                        onSubmit={() => this.setState({ showRemerciements: true })}
                    />
                }
                <Footer stagiaire={stagiaire} infosRegion={infosRegion} />
            </div>
        );
    }
}

export default Questionnaire;
