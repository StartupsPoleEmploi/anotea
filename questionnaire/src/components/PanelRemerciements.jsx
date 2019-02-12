import React, { Component } from 'react';

import PropTypes from 'prop-types';

import './panelRemerciements.scss';

class PanelRemerciements extends Component {

    static propTypes = {
        infosRegion: PropTypes.object.isRequired,
        token: PropTypes.string.isRequired
    };

    render() {
        return (
            <div className="panel-remerciements">
                { this.props.infosRegion.showLinks &&
                <div>
                    <h1>Et après la formation ?</h1>
                    <p>Vous avez <strong>mis votre CV à jour</strong> ? Nous pouvons vous aider à <strong>trouver un emploi</strong> !</p>

                    <div className="links">
                        <div className="link">
                            <a className="btn" href={`/link/${this.props.token}?goto=lbb`} target="_blank" rel="noopener noreferrer"><strong>Les entreprises qui recrutent</strong> dans votre secteur</a>
                        </div>
                        <div className="link">
                            <a className="btn" href={`/link/${this.props.token}?goto=pe`} target="_blank" rel="noopener noreferrer"><strong>Les offres d’emploi</strong> en lien avec votre formation</a>
                        </div>
                        <div className="link">
                            <a className="btn" href={`/link/${this.props.token}?goto=clara`} target="_blank" rel="noopener noreferrer"><strong>Les aides au retour à l’emploi</strong> avec l’outil Clara</a>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
                }
                <section className="divPage3">
                    <h2>Merci d'avoir particip&eacute;</h2>
                    <blockquote>
                        <p className="txtPage3">Vos notes et commentaires seront publi&eacute;s sur les futures formations similaires &agrave; votre session de formation, sur nos sites partenaires ci-dessous.</p>
                    </blockquote>
                    <blockquote className="remerciements">
                        <div className="imgLien">
                            <a className="textimage" href="https://labonneformation.pole-emploi.fr/" title="Visiter labonneformation.fr" target="_blank" rel="noopener noreferrer"><img src="/img/labonneformation.png" alt="" /> </a>
                            { this.props.infosRegion.carifLinkEnabled &&
                                <a className="textimage" href="<%= carifURL %>" target="_blank"><img src="/img/regions/logo-questionnaire/carif-<%=trainee.codeRegion%>.png" alt="" /> </a>
                            }
                        </div>
                    </blockquote>
                </section>
            </div>
        );
    }
}

export default PanelRemerciements;
