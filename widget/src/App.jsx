import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListeWidget from './components/ListeWidget';
import { getAvis, getScore } from './services/widgetService';
import GridDisplayer from './components/common/library/GridDisplayer';
import WidgetContext from './components/WidgetContext';
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

    async fetchAvis(options) {
        let { type, identifiant } = this.props;

        this.setState({ results: await getAvis(type, identifiant, options) });
    }

    async componentDidMount() {
        let { type, identifiant, format } = this.props;

        if (!['organisme', 'formation', 'action', 'session'].includes(type) ||
            !['score', 'carrousel', 'liste'].includes(format)) {
            return this.setState({ error: true });
        }

        this.setState({ score: await getScore(type, identifiant) });
    }

    render() {

        let { format } = this.props;


        if (this.state.error) {
            return (<div className="anotea">Une erreur est survenue</div>);
        }

        let widget = null;
        if (format === 'score') {
            widget = <ScoreWidget {...this.state} />;
        } else if (format === 'carrousel') {
            widget = <CarrouselWidget {...this.state} fetchAvis={options => this.fetchAvis(options)} />;
        } else {
            widget = <ListeWidget {...this.state} fetchAvis={options => this.fetchAvis(options)} />;
        }

        return (
            <div className="anotea">
                {false && <GridDisplayer />}
                <div className="container-fluid">
                    <WidgetContext.Provider value={this.props}>
                        {widget}
                    </WidgetContext.Provider>
                </div>
            </div>
        );
    }
}

App.defaultProps = {
    format: 'liste',
    type: 'organisme',
    identifiant: '13000362700010',
    options: 'json-ld',
};

export default App;
