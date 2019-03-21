import React, { Component } from 'react';
import { getStagiaireInfo } from './lib/stagiaireService';
import Questionnaire from './components/pages/Questionnaire';
import Remerciements from './components/pages/Remerciements';
import ErrorPage from './components/pages/ErrorPage';
import Footer from './components/common/Footer';
import './App.scss';

class App extends Component {

    state = {
        stagiaire: null,
        infosRegion: null,
        showRemerciements: false,
        showErrorPage: false,
    };

    static getToken() {
        let urlParts = window.location.href.split('/');
        return urlParts[urlParts.length - 1];
    }

    fetchStagiaire = async () => {
        try {
            let response = await getStagiaireInfo(App.getToken());
            this.setState({
                stagiaire: response.stagiaire,
                infosRegion: response.infosRegion,
                showRemerciements: response.submitted,
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
        let { stagiaire } = this.state;

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
                    <Remerciements stagiaire={stagiaire} infosRegion={this.state.infosRegion} /> :
                    <Questionnaire
                        stagiaire={stagiaire}
                        onSubmit={() => this.setState({ showRemerciements: true })} />
                }
                <Footer stagiaire={stagiaire} />
            </div>
        );
    }
}

export default App;
