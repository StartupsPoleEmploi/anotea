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
import Panel from '../../common/page/panel/Panel';
import Loader from '../../common/Loader';

export default class AvisPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
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

    render() {

        let { results, message } = this.state;
        let { query, onFilterClicked } = this.props;

        return (
            <Panel
                filters={
                    <Filters>
                        <Filter
                            label="Tous"
                            isActive={() => !query.status && !query.reponseStatus && !query.read}
                            onClick={() => onFilterClicked({ sortBy: 'date' })} />

                        <Filter
                            label="Nouveaux"
                            isActive={() => query.read === 'true'}
                            onClick={() => onFilterClicked({ read: true, sortBy: 'date' })} />

                        <Filter
                            label="Lus"
                            isActive={() => query.read === 'false'}
                            onClick={() => onFilterClicked({ read: false, sortBy: 'date' })} />

                        <Filter
                            label="Répondus"
                            isActive={() => query.reponseStatus === 'published'}
                            onClick={() => onFilterClicked({
                                reponseStatus: 'published',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                        />

                        <Filter
                            label="Rejetés"
                            isActive={() => query.status === 'reported'}
                            getNbElements={() => _.get(results.meta.stats, 'status.reported')}
                            onClick={() => onFilterClicked({
                                reponseStatus: 'rejected',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                        />

                        <Filter
                            label="Signalés"
                            isActive={() => query.status === 'reported'}
                            onClick={() => onFilterClicked({ status: 'reported', sortBy: 'lastStatusUpdate' })}
                            getNbElements={() => _.get(results.meta.stats, 'status.reported')}
                        />

                        <Filter
                            label="Signalés"
                            isActive={() => query.status === 'rejected'}
                            onClick={() => onFilterClicked({ status: 'rejected', sortBy: 'lastStatusUpdate' })} />
                    </Filters>
                }
                summary={
                    <Summary
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
                    this.state.loading ?
                        <Loader centered={true} /> :
                        <AvisResults
                            results={results}
                            message={message}
                            renderAvis={avis => {
                                return <Avis avis={avis} readonly={true} showStatus={true} onChange={() => ({})} />;
                            }} />
                }
                pagination={
                    <Pagination
                        pagination={results.meta.pagination}
                        onClick={page => onFilterClicked({ page })} />}
            />
        );

    }

}
