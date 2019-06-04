import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListeWidget from './components/ListeWidget';
import { getScore, getAvis } from './services/widgetService';
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
        };
    }

    async fetchAvis(page, itemsParPage) {
        let { type, identifiant } = this.props;

        let results = await getAvis(type, identifiant, page, itemsParPage);
        this.setState({ results });
    }

    async componentDidMount() {
        let { type, identifiant } = this.props;

        if (!['organisme', 'formation', 'action', 'session'].includes(type)) {
            return this.setState({ error: true });
        }

        this.setState({ score: await getScore(type, identifiant) });
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
            widget = <CarrouselWidget
                {...this.state}
                fetchAvis={(page, itemsParPage) => this.fetchAvis(page, itemsParPage)}
            />;
        } else {
            widget = (
                <ListeWidget
                    {...this.state}
                    fetchAvis={(page, itemsParPage) => this.fetchAvis(page, itemsParPage)}
                    showContactStagiaire={options.indexOf('contact-stagiaire') !== -1} />);
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
    format: 'carrousel',
    type: 'action',
    identifiant: '26_100646|26_145859_7591',
};

export default App;
