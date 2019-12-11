import React from 'react';
import PropTypes from 'prop-types';
import { Filters } from '../../common/page/panel/filters/Filters';
import Filter from '../../common/page/panel/filters/Filter';
import _ from 'lodash';
import Summary from '../../common/page/panel/summary/Summary';
import Button from '../../common/Button';
import { getExportAvisUrl, searchAvis } from '../../../services/avisService';
import AvisResults from '../../common/page/panel/results/AvisResults';
import Avis from '../../common/avis/Avis';
import Pagination from '../../common/page/panel/pagination/Pagination';
import BadgeSummary from '../../common/page/panel/summary/BadgeSummary';
import Panel from '../../common/page/panel/Panel';
import Loader from '../../common/Loader';

export default class FinanceurAvisPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
        onFilterClicked: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            loading: false,
            results: {
                avis: [],
                meta: {
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

    render() {

        let { results, message } = this.state;
        let { query, form, onFilterClicked } = this.props;

        return (
            <Panel
                filters={
                    <Filters>
                        <Filter
                            label="Tous"
                            isActive={() => !query.statuses && !query.qualification}
                            onClick={() => onFilterClicked({ sortBy: 'date' })}
                        />

                        <Filter
                            label="Commentaires"
                            isActive={() => query.commentaires === 'true'}
                            onClick={() => onFilterClicked({ commentaires: true, sortBy: 'lastStatusUpdate' })}
                        />

                        <Filter
                            label="Négatifs"
                            isActive={() => query.qualification === 'négatif'}
                            onClick={() => {
                                return onFilterClicked({
                                    statuses: 'validated', qualification: 'négatif', sortBy: 'lastStatusUpdate'
                                });
                            }}
                        />

                        <Filter
                            label="Positifs ou neutres"
                            isActive={() => query.qualification === 'positif'}
                            onClick={() => {
                                return onFilterClicked({
                                    statuses: 'validated', qualification: 'positif', sortBy: 'lastStatusUpdate'
                                });
                            }}
                        />

                        <Filter
                            label="Signalés"
                            isActive={() => query.statuses === 'reported'}
                            onClick={() => onFilterClicked({ statuses: 'reported', sortBy: 'lastStatusUpdate' })}
                        />

                        <Filter
                            label="Rejetés"
                            isActive={() => query.statuses === 'rejected'}
                            onClick={() => onFilterClicked({ statuses: 'rejected', sortBy: 'lastStatusUpdate' })}
                        />
                    </Filters>
                }
                summary={
                    <Summary
                        title={<BadgeSummary form={form} query={query} />}
                        paginationLabel="avis"
                        pagination={results.meta.pagination}
                        buttons={
                            <Button
                                size="medium"
                                onClick={() => window.open(getExportAvisUrl(_.omit(query, ['page'])))}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        }
                    />
                }
                results={
                    this.state.loading ?
                        <Loader centered={true} /> :
                        <AvisResults
                            results={results}
                            message={message}
                            renderAvis={avis => <Avis avis={avis} />}
                        />
                }
                pagination={
                    <Pagination
                        pagination={results.meta.pagination}
                        onClick={page => onFilterClicked({ ...query, page })} />}
            />
        );

    }

}
