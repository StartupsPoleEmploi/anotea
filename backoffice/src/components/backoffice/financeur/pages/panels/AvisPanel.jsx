import React from 'react';
import PropTypes from 'prop-types';
import '../components/QueryBadges.scss';
import { Filters } from '../../../common/page/panel/filters/Filters';
import Filter from '../../../common/page/panel/filters/Filter';
import _ from 'lodash';
import Summary from '../../../common/page/panel/summary/Summary';
import Button from '../../../common/Button';
import { getExportAvisUrl, searchAvis } from '../../financeurService';
import AvisResults from '../../../common/page/panel/results/AvisResults';
import Avis from '../../../common/avis/Avis';
import Pagination from '../../../common/page/panel/pagination/Pagination';
import QueryBadges from '../components/QueryBadges';
import NewPanel from '../../../common/page/panel/NewPanel';

export default class AvisPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        onNewQuery: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            loading: false,
            results: {
                avis: [],
                meta: {
                    stats: {},
                    pagination: {
                        itemsOnThisPage: 0,
                        itemsPerPage: 0,
                        page: 0,
                        totalItems: 0,
                        totalPages: 0,
                    }
                }
            },
        };
    }

    componentDidMount() {
        this.search();
    }

    componentDidUpdate(previous) {
        if (!_.isEqual(this.props.query, previous.query)) {
            this.search();
        }
    }

    search = () => {
        return new Promise(resolve => {
            this.setState({ loading: true }, async () => {
                let results = await searchAvis(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    onFilterClicked = parameters => {
        return this.props.onNewQuery({
            status: 'all',
            sortBy: 'date',
            ...parameters,
        });
    };

    render() {

        let { results, message } = this.state;
        let { query, form } = this.props;

        return (
            <NewPanel
                filters={
                    <Filters>
                        <Filter
                            label="Tous"
                            isActive={() => query.status === 'all' && !query.qualification}
                            onClick={() => this.onFilterClicked({ status: 'all', sortBy: 'date' })} />

                        <Filter
                            label="Commentaires"
                            isActive={() => query.qualification === 'all'}
                            onClick={() => this.onFilterClicked({ qualification: 'all', sortBy: 'date' })} />

                        <Filter
                            label="Négatifs"
                            isActive={() => query.qualification === 'négatif'}
                            onClick={() => this.onFilterClicked({ qualification: 'négatif', sortBy: 'date' })} />

                        <Filter
                            label="Positifs ou neutres"
                            isActive={() => query.qualification === 'positif'}
                            onClick={() => this.onFilterClicked({ qualification: 'positif', sortBy: 'date' })} />

                        <Filter
                            label="Signalés"
                            isActive={() => query.status === 'reported'}
                            getNbElements={() => _.get(results.meta.stats, 'status.reported')}
                            onClick={() => this.onFilterClicked({ status: 'reported', sortBy: 'lastStatusUpdate' })} />

                        <Filter
                            label="Rejetés"
                            isActive={() => query.status === 'rejected'}
                            onClick={() => this.onFilterClicked({ status: 'rejected', sortBy: 'lastStatusUpdate' })} />
                    </Filters>
                }
                summary={
                    <Summary
                        title={<QueryBadges form={form} query={query} />}
                        paginationLabel="avis"
                        pagination={results.meta.pagination}
                        buttons={
                            <Button
                                size="medium"
                                onClick={() => window.open(getExportAvisUrl(_.omit(query, ['page'])))}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        }
                    />}
                results={
                    <AvisResults
                        results={results}
                        message={message}
                        renderAvis={avis => <Avis avis={avis} readonly={true} showStatus={true} onChange={() => ({})} />} />
                }
                pagination={
                    <Pagination
                        pagination={results.meta.pagination}
                        onClick={page => this.onFilterClicked({ page })} />}
            />
        );

    }

}
