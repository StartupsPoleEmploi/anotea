import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListeWidget from './components/ListeWidget';
import { getOrganismesFormateur } from './components/services/organismeService';
import { getFormation, getAction, getSession } from './components/services/formationService';
import GridDisplayer from './components/common/library/GridDisplayer';
import ScoreWidget from './components/ScoreWidget';
import CarrouselWidget from './components/CarrouselWidget';
import './App.scss';

class App extends Component {

    static propTypes = {
        format: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        identifiant: PropTypes.string.isRequired,
        options: PropTypes.string,
    };

    constructor() {
        super();
        this.state = {
            error: false,
            score: {
                nb_avis: 0,
                notes: {
                    accueil: 0,
                    contenu_formation: 0,
                    equipe_formateurs: 0,
                    moyen_materiel: 0,
                    accompagnement: 0,
                    global: 0,
                }
            },
            results: {
                avis: [],
                meta: {
                    pagination: {
                        page: 0,
                        items_par_page: 0,
                        total_items: 0,
                        total_pages: 0,
                    }
                }
            },
            pristine: true,
        };
    }

    async componentDidMount() {
        let { type, identifiant } = this.props;

        let fetch = null;
        switch (type) {
            case 'organisme':
                fetch = () => getOrganismesFormateur(identifiant);
                break;
            case 'formation':
                fetch = () => getFormation(identifiant);
                break;
            case 'action':
                fetch = () => getAction(identifiant);
                break;
            case 'session':
                fetch = () => getSession(identifiant);
                break;
            default:
                fetch = () => ({ error: true });
        }

        let results = await fetch();
        this.setState({ ...results });
    }

    render() {

        let { format, options = '' } = this.props;

        if (this.state.error) {
            return (<div className="anotea">Une erreur est survenue</div>);
        }

        let widget = null;
        if (format === 'score') {
            widget = <ScoreWidget {...this.state} />;
        } else if (format === 'carrousel') {
            widget = <CarrouselWidget {...this.state} />;
        } else {
            widget = (
                <ListeWidget {...this.state} showContactStagiaire={options.indexOf('contact-stagiaire') !== -1} />);
        }

        return (
            <div className="anotea">
                {false && <GridDisplayer />}
                <div className="container-fluid">
                    {widget}
                </div>
            </div>
        );
    }
}

App.defaultProps = {
    format: 'liste',
    type: 'organisme',
    identifiant: '13002087800018',
};

export default App;
