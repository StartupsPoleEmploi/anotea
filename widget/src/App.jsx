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
        layout: PropTypes.string.isRequired,
        siret: PropTypes.string,
        formation: PropTypes.string,
        action: PropTypes.string,
        session: PropTypes.string,
    };

    constructor() {
        super();
        this.state = {
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
        let { siret, formation, action, session } = this.props;

        let results = null;
        if (siret) {
            results = await getOrganismesFormateur(siret);
        } else if (formation) {
            results = await getFormation(formation);
        } else if (action) {
            results = await getAction(action);
        } else {
            results = await getSession(session);
        }

        this.setState({ ...results });
    }

    render() {

        let { layout } = this.props;

        let widget = null;
        if (layout === 'score') {
            widget = <ScoreWidget {...this.state} />;
        } else if (layout === 'carrousel') {
            widget = <CarrouselWidget {...this.state} />;
        } else {
            widget = (
                <div>
                    <div className="d-none d-md-block">
                        <ListeWidget {...this.state} />
                    </div>
                    <div className="d-sm-block d-md-none">
                        <CarrouselWidget {...this.state} />
                    </div>
                </div>
            );
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
    siret: '13002087800018',
    layout: 'liste',
};

export default App;
