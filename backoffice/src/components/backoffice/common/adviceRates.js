import React from 'react';

import PropTypes from 'prop-types';

import Stars from './Stars';

export default class AdviceRates extends React.Component {

    state = {};

    static propTypes = {
        rates: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            rates: props.rates,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.rates) {
            this.setState({ rates: nextProps.rates });
        }
    }

    render() {
        return (
            <div className="AdviceRates">
                <div className="row">
                    <div className="col-md-6 description">Note globale</div>
                    <div className="col-md-6 starsContainer">
                        <Stars value={this.state.rates.global} />
                    </div>
                </div>

                <div className="detail">
                    <div className="row">
                        <div className="col-md-6 description">Accueil</div>
                        <div className="col-md-6 starsContainer"><Stars value={this.state.rates.accueil} /></div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 description">Contenu</div>
                        <div className="col-md-6 starsContainer"><Stars value={this.state.rates.contenu_formation} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 description">&Eacute;quipe formateurs</div>
                        <div className="col-md-6 starsContainer"><Stars value={this.state.rates.equipe_formateurs} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 description">Moyens</div>
                        <div className="col-md-6 starsContainer"><Stars value={this.state.rates.moyen_materiel} /></div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 description">Accompagnement</div>
                        <div className="col-md-6 starsContainer"><Stars value={this.state.rates.accompagnement} /></div>
                    </div>
                </div>
            </div>
        );
    }
}
