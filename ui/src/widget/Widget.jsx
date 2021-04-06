import _ from 'lodash';
import React, { Component } from 'react';
import ListeWidget from './ListeWidget';
import { getAvis, getScore } from './services/widgetService';
import WidgetContext from './WidgetContext';
import ScoreWidget from './ScoreWidget';
import CarrouselWidget from './CarrouselWidget';
import queryString from 'query-string';
import 'iframe-resizer/js/iframeResizer.contentWindow.min';
import './Widget.scss';
import WithAnalytics from '../common/components/analytics/WithAnalytics';

class Widget extends Component {

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

    getParameters() {
        let urlParams = window.location.search;
        if (_.isEmpty(urlParams)) {
            return {
                format: 'carrousel',
                type: 'session',
                identifiant: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
                options: 'json-ld',
                'show-if-0-reviews': false
            };
        }
        return queryString.parse(urlParams);
    }

    async componentDidMount() {
        let { type, format } = this.getParameters();

        if (!['organisme', 'formation', 'action', 'session'].includes(type) ||
            !['score', 'carrousel', 'liste'].includes(format)) {
            return this.setState({ error: true });
        }

        this.fetchScore();
    }

    async fetchScore() {
        let { type, identifiant } = this.getParameters();

        try {
            let score = await getScore(type, identifiant);
            this.setState({ score });
        } catch (e) {
            if (!e.statusCode || e.statusCode > 404) {
                // sendError(e);
            }
        }
    }

    async fetchAvis(options) {
        let { type, identifiant } = this.getParameters();

        try {
            let results = await getAvis(type, identifiant, options);
            this.setState({ results });
        } catch (e) {
            if (!e.statusCode || e.statusCode > 404) {
                // sendError(e);
            }
        }
    }

    render() {

        let { format } = this.getParameters();

        if (this.state.error) {
            return (<div className="Widget">Une erreur est survenue</div>);
        }

        let widget;
        if (format === 'score') {
            widget = <ScoreWidget {...this.state} />;
        } else if (format === 'carrousel') {
            widget = <CarrouselWidget {...this.state} fetchAvis={options => this.fetchAvis(options)} />;
        } else {
            widget = <ListeWidget {...this.state} fetchAvis={options => this.fetchAvis(options)} />;
        }

        return (
            <WithAnalytics category="widget">
                <div className="Widget">
                    <div className="container-fluid">
                        <WidgetContext.Provider value={this.getParameters()}>
                            {widget}
                        </WidgetContext.Provider>
                    </div>
                </div>
                <div data-iframe-height></div>
            </WithAnalytics>
        );
    }
}

export default Widget;
