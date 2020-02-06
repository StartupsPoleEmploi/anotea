import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Panel from '../../common/page/panel/Panel';
import { getPublicStats } from '../../../services/statsService';
import Button from '../../../../common/components/Button';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import AvisStats from './AvisStats';
import PDF, { buildPDF } from '../../common/pdf/PDF';
import OrganismeStats from './OrganismeStats';
import CommentairesStats from './CommentairesStats';
import FormationStats from './FormationStats';

export default class StatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        onFilterClicked: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
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
        return new Promise(async resolve => {
            let results = await getPublicStats(this.props.query);
            this.setState({ results }, () => resolve());
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

    render() {

        let { query } = this.props;
        let { results } = this.state;

        if (_.isEmpty(results.stats)) {
            return <EmptyResults />;
        }

        return (
            <>
                <Panel
                    className="StatsPanel"
                    summary={
                        <div className="row">
                            <div className="offset-sm-8 col-sm-4 text-right">
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
                        <div>
                            <div className="row mb-4">
                                <div className="col-12">
                                    <AvisStats query={query} stats={results.stats} />
                                </div>
                            </div>
                            <div className="row mb-4">
                                <div className="col-sm-12 col-md-6">
                                    <CommentairesStats query={query} stats={results.stats} />
                                </div>
                                <div className="col-sm-12 col-md-6">
                                    <FormationStats query={query} stats={results.stats} />
                                </div>
                            </div>
                            <div className="row mb-4">
                                <div className="col-12">
                                    <OrganismeStats query={query} stats={results.stats} />
                                </div>
                            </div>
                        </div>
                    }
                />
                {this.state.showPDFDocument &&
                <div ref={this.pdfReference}>
                    <PDF
                        title={'Statistiques'}
                        main={
                            <div>
                                PDF
                            </div>
                        }
                    />
                </div>
                }
            </>
        );
    }
}
