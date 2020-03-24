import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getAvisStats } from '../../../services/avisService';
import Panel from '../../common/page/panel/Panel';
import Loader from '../../../../common/components/Loader';
import CommentairesPies from '../../common/avis/charts/CommentairesPies';
import NoteRepartition from '../../common/avis/charts/NoteRepartition';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import Button from '../../../../common/components/Button';
import NoteExplications from '../../common/avis/charts/NoteExplications';
import PDF, { buildPDF } from '../../common/pdf/PDF';
import BackofficeContext from '../../../BackofficeContext';
import moment from 'moment';
import './FinanceurAvisChartsPanel.scss';

export default class FinanceurAvisChartsPanel extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            stats: {},
            showPDFDocument: false,
        };
        this.pdfReference = React.createRef();
    }

    componentDidMount() {
        this.fetchStats();
    }

    componentDidUpdate(previous) {
        if (!_.isEqual(this.props.query, previous.query)) {
            this.fetchStats();
        }
    }

    fetchStats = () => {
        return new Promise(resolve => {
            this.setState({ loading: true }, async () => {
                let stats = await getAvisStats(this.props.query);
                this.setState({ stats, loading: false }, () => resolve());
            });
        });
    };

    generatePDF = () => {
        this.setState({ showPDFDocument: true }, async () => {
            window.scrollTo(0, 0);
            new Promise(resolve => setTimeout(() => resolve(), 250))
            .then(() => buildPDF(this.pdfReference.current))
            .then(() => this.setState({ showPDFDocument: false }));
        });
    };

    getPDFContent = () => {
        let { account } = this.context;
        let { stats } = this.state;
        let { query, store } = this.props;
        let { departements, formations, sirens } = store;

        let departement = departements && departements.find(f => f.code === query.departement);
        let siren = sirens && sirens.find(f => f.siren === query.siren);
        let formation = formations && formations.find(f => f.numeroFormation === query.numeroFormation);
        let debut = query.debut ? moment(parseInt(query.debut)).format('DD/MM/YYYY') : null;
        let fin = moment(query.fin ? parseInt(query.fin) : new Date()).format('DD/MM/YYYY');
        let title = siren ? `Résultats pour ${siren.name}` : 'Résultats pour tous les organismes';

        return (
            <PDF
                title={title}
                summary={
                    <div className="pdf-summary d-flex justify-content-center align-items-center">
                        <span>Formation échues {debut ? `entre le ${debut} et le ${fin}` : `jusqu'au ${fin}`}</span>
                        <span>{departement ? departement.label : 'Tous les départements'}</span>
                        <span>{siren ? siren.name : 'Toutes les organismes'}</span>
                        <span>{formation ? formation.title : 'Toutes les formations'}</span>
                    </div>
                }
                main={
                    _.isEmpty(stats) ? <EmptyResults /> : (
                        <>
                            <div className="row">
                                <div className="col-sm-12">
                                    <NoteExplications notes={stats.notes} total={stats.total} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <CommentairesPies stats={stats} />
                                </div>
                            </div>
                        </>
                    )
                }
                footer={account.region}
            />
        );
    };

    render() {

        let { stats } = this.state;

        return (
            <div className="FinanceurAvisChartsPanel">
                <Panel
                    backgroundColor="grey"
                    summary={
                        <div className="row">
                            <div className="col-sm-12 text-right">
                                <Button
                                    style={{ opacity: '0.75' }}
                                    size="medium"
                                    disabled={this.state.showPDFDocument}
                                    onClick={() => this.generatePDF()}>
                                    <i className="fas fa-download pr-2"></i>Exporter
                                </Button>
                            </div>
                        </div>
                    }
                    results={
                        this.state.loading ? <Loader centered={true} /> :
                            _.isEmpty(stats) ? <EmptyResults /> : (
                                <>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <NoteRepartition notes={stats.notes} total={stats.total} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <CommentairesPies stats={stats} />
                                        </div>
                                    </div>
                                </>
                            )
                    }
                />
                {this.state.showPDFDocument &&
                <div ref={this.pdfReference}>
                    {this.getPDFContent()}
                </div>
                }
            </div>
        );
    }
}
