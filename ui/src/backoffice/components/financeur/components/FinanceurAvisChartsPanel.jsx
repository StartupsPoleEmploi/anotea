import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getAvisStats } from '../../../services/statsService';
import Panel from '../../common/page/panel/Panel';
import BadgeSummary from '../../common/page/panel/summary/BadgeSummary';
import Loader from '../../../../common/components/Loader';
import CommentairesPies from '../../common/avis/charts/CommentairesPies';
import NoteRepartition from '../../common/avis/charts/NoteRepartition';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import Button from '../../../../common/components/Button';
import NoteExplications from '../../common/avis/charts/NoteExplications';
import PDF, { buildPDF } from '../../common/pdf/PDF';
import TextSummary from '../../common/page/panel/summary/TextSummary';
import AppContext from '../../../BackofficeContext';

export default class FinanceurAvisChartsPanel extends React.Component {

    static contextType = AppContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            results: {},
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
                let results = await getAvisStats(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
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

    getPDFTitle = () => {
        let { query, form } = this.props;
        let siren = form.sirens && form.sirens.results.find(f => f.siren === query.siren);
        if (siren) {
            return `Résultats pour ${siren.name}`;
        }
        return 'Résultats pour tous les organismes';
    };

    render() {

        let { account } = this.context;
        let { query, form } = this.props;
        let stats = this.state.results;

        return (
            <>
                <Panel
                    backgroundColor="grey"
                    summary={
                        <div className="row">
                            <div className="col-sm-10">
                                <BadgeSummary form={form} query={query} ellipsis={30} />
                            </div>
                            <div className="col-sm-2 text-right">
                                <Button
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
                    <PDF
                        title={this.getPDFTitle()}
                        summary={<TextSummary form={form} query={query} />}
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
                </div>
                }
            </>
        );
    }
}
