import React from 'react';

import Stars from '../common/Stars';

export default class SessionStats extends React.Component {

    data = {
        location: {
            city: 'Saint-Denis',
            postalCode: '93200'
        },
        startDate: '02/01/2017',
        endDate: '20/03/2017',
        globalStats: {
            adviceCount: 5,
            commentsCount: 3
        },
        globalRatesAverage: 2.75,
        ratesCount: [5, 8, 13, 11, 2],
        ratesAverage: {
            accueil: 1.2,
            contenu_formation: 3.1,
            equipe_formateurs: 3.9,
            moyen_materiel: 2.7,
            accompagnement: 2.1
        }
    }

    constructor(props) {
        super(props);
        this.sumRates = this.data.ratesCount.reduce((a, b) => a + b, 0);
    }

    render() {
        return (
            <div className="SessionStats">
                <h3>Sessions sélectionnées</h3>
                <div className="row">
                    <div className="col-md-3 metadata">
                        <h4>{this.data.location.city} ({this.data.location.postalCode})</h4>
                        <ul>
                            <li><strong>Début</strong> <span>{this.data.startDate}</span></li>
                            <li><strong>Fin</strong> <span>{this.data.endDate}</span></li>
                            <li><strong>{this.data.globalStats.adviceCount} avis</strong></li>
                            <li><strong>{this.data.globalStats.commentsCount} commentaires</strong></li>
                        </ul>
                    </div>
                    <div className="col-md-9 rates">
                        <h4>Notes moyennes</h4>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="title">
                                    <strong>Avis global</strong>
                                    <Stars value={Math.round(this.data.globalRatesAverage)} />
                                    <strong>{this.data.globalRatesAverage}/5</strong>
                                </div>
                                <ul>
                                    {this.data.ratesCount.map((count, index) =>
                                        <li key={index}><strong>{5 - index}</strong>
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" aria-valuenow={count}
                                                    aria-valuemin="0" aria-valuemax="100"
                                                    style={{ width: count / this.sumRates * 100 + '%' }}></div>
                                            </div>
                                            {count} notes</li>
                                    )}
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <div className="title">
                                    <strong>Autres critères notés</strong>
                                </div>
                                <div className="row">
                                    <div className="col-md-5">Accueil</div>
                                    <div className="col-md-4"><Stars value={Math.round(this.data.ratesAverage.accueil)} /></div>
                                    <div className="col-md-3">{this.data.ratesAverage.accueil}/5</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-5">Contenu</div>
                                    <div className="col-md-4"><Stars value={Math.round(this.data.ratesAverage.contenu_formation)} />
                                    </div>
                                    <div className="col-md-3">{this.data.ratesAverage.contenu_formation}/5</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-5">&Eacute;quipe formateurs</div>
                                    <div className="col-md-4"><Stars value={Math.round(this.data.ratesAverage.equipe_formateurs)} />
                                    </div>
                                    <div className="col-md-3">{this.data.ratesAverage.equipe_formateurs}/5</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-5">Moyens</div>
                                    <div className="col-md-4"><Stars value={Math.round(this.data.ratesAverage.moyen_materiel)} />
                                    </div>
                                    <div className="col-md-3">{this.data.ratesAverage.moyen_materiel}/5</div>
                                </div>
                                <div className="row">
                                    <div className="col-md-5">Accompagnement</div>
                                    <div className="col-md-4"><Stars value={Math.round(this.data.ratesAverage.accompagnement)} />
                                    </div>
                                    <div className="col-md-3">{this.data.ratesAverage.accompagnement}/5</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
