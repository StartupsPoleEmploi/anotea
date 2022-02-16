import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Formation from './Formation';
import peLogoMarianne from '../images/pe-logo-marianne.png';
import peSvg from '../images/pole-emploi-fr.svg';
import logoMarianne from '../images/logo2021-marianne.svg';
import './remerciements.scss';

class Remerciements extends Component {

    static propTypes = {
        stagiaire: PropTypes.object.isRequired,
        infosRegion: PropTypes.object.isRequired
    };

    render() {

        let { stagiaire, infosRegion } = this.props;

        return (
            <div className="anotea remerciements">
                <div className="container">
                    <Formation stagiaire={stagiaire} />
                    <div className="row">
                        <div className="col-sm-12 offset-md-1 col-md-10 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">

                            <div className="panel-remerciements">
                                {infosRegion.showLinks &&
                                <div className="links-block">
                                    <h1>Et après la formation...</h1>
                                    <p>
                                        Vous avez <strong>mis votre CV à jour</strong> ?
                                        Nous pouvons vous aider à <strong>trouver un emploi</strong> !
                                    </p>

                                    <div className="links">
                                        <div className="link">
                                            <a
                                                className="btn"
                                                href={`/link/${stagiaire.token}?goto=lbb`}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                <strong>Les entreprises qui recrutent</strong> dans votre secteur
                                            </a>
                                        </div>
                                        <div className="link">
                                            <a
                                                className="btn"
                                                href={`/link/${stagiaire.token}?goto=pe`}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                <strong>Les offres d’emploi</strong> en lien avec votre formation</a>
                                        </div>
                                        <div className="link">
                                            <a
                                                className="btn"
                                                href={`/link/${stagiaire.token}?goto=clara`}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                <strong>Les aides au retour à l’emploi</strong> avec l’outil Clara
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                }

                                <section className="merci">
                                    <h2>Merci d&apos;avoir particip&eacute;</h2>
                                    <p>
                                        Vos notes et commentaires seront publi&eacute;s sur les futures formations
                                        similaires &agrave; votre session de formation, sur nos sites partenaires
                                        ci-dessous.
                                    </p>

                                    <div className="liens">
                                        {infosRegion.region.carif.active &&
                                        <a
                                            className="textimage"
                                            href={infosRegion.region.carif.url}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <img
                                                src={
                                                    process.env.PUBLIC_URL +
                                                    `/images/regions/carif-${stagiaire.codeRegion}.png`}
                                                alt="logo carif" />
                                        </a>
                                        }
                                        <a
                                            className="textimage"
                                            href="https://candidat.pole-emploi.fr/formations/recherche"
                                            title="Visiter labonneformation.fr"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <img src={logoMarianne} alt="labonneformation" height="86px" />
                                            <img src={peSvg} alt="labonneformation" height="86px" />
                                        </a>
                                    </div>
                                </section>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Remerciements;
