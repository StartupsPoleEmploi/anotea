import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '../../common/Pagination';
import Organisme from './components/Organisme';

export default class OrganismeResults extends React.Component {

    static propTypes = {
        results: PropTypes.object.isRequired,
        refresh: PropTypes.func.isRequired,
        onNewQuery: PropTypes.func.isRequired,
    };

    render() {
        let { results, onNewQuery, refresh } = this.props;

        return (
            <div>
                {
                    results.organismes.map((organisme, key) => {
                        return (
                            <div key={key} className="row">
                                <div className="col-sm-12">
                                    <Organisme
                                        organisme={organisme}
                                        onChange={(avis, options = {}) => refresh(options)} />
                                </div>
                            </div>
                        );
                    })
                }
                {results.meta.pagination.totalPages > 1 &&
                <div className="row justify-content-center">
                    <div className="col-4 d-flex justify-content-center">
                        <Pagination
                            pagination={results.meta.pagination}
                            onClick={page => onNewQuery({ page })} />
                    </div>
                </div>
                }
            </div>
        );
    }
}
