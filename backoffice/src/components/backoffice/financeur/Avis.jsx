import React from 'react';
import PropTypes from 'prop-types';
import Formation from '../moderateur/moderation/components/avis/Formation';
import Commentaire from '../moderateur/moderation/components/avis/Commentaire';
import Notes from '../moderateur/moderation/components/avis/Notes';
import Titre from './Titre';
import Stars from '../common/Stars';
import PrettyDate from '../common/PrettyDate';

const POLE_EMPLOI = '4';

export default function Avis({ avis, codeFinanceur }) {
    return (
        <div className="Avis">
            <div className="row">
                <div style={{ 'borderRight': '2px solid #F4F4F5' }} className={`col-sm-3 offset-md-1`}>
                    <Formation avis={avis} />
                </div>

                <div className={`col-sm-7 col-md-6 `}>
                    <div>
                        <div className="mb-3">
                            <div className="Stagiaire">
                                <div>
                                    <Stars rate={avis.rates.global} />
                                    <span className="by">par&nbsp;</span>
                                    <span className={`pseudo mr-1 ${avis.pseudoMasked ? 'masked' : ''}`}>
                                        {avis.pseudo ? avis.pseudo : 'anonyme'}
                                    </span>
                                </div>

                                <div className="date">
                                    le <PrettyDate date={new Date(avis.date)} /> &nbsp;
                                    { avis.archived &&
                                        <span>archivé &nbsp;</span>
                                    }
                                    {codeFinanceur === POLE_EMPLOI && avis.published &&
                                        <span className={`status ${avis.qualification === 'positif' ? 'published' : 'rejected'}`}>
                                            (<span>Publié le <PrettyDate date={new Date(avis.lastStatusUpdate)} /> &nbsp; comme <b>{avis.qualification}</b></span>)
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="mb-1">
                            <Titre avis={avis} />
                        </div>

                        <div className="mb-1">
                            <Commentaire avis={avis} />
                        </div>

                        <div className="mt-2 d-none d-lg-block">
                            <Notes avis={avis} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Avis.propTypes = {
    codeFinanceur: PropTypes.string.isRequired,
    avis: PropTypes.object.isRequired
};
