import React from 'react';
import PropTypes from 'prop-types';
import { PaginationSummary } from './Pagination';
import './Summary.scss';

export default class Summary extends React.Component {

    static propTypes = {
        pagination: PropTypes.object.isRequired,
        empty: PropTypes.string.isRequired,
        title: PropTypes.array.isRequired,
    };

    render() {
        let { pagination, empty, title } = this.props;

        if (pagination.totalItems === 0) {
            return (<p className="Summary">{empty}</p>);
        }

        return (
            <div className="Summary row">
                <div className="offset-4 col-4 ">
                    {title}
                </div>

                <span className="pages col-sm-4 col-md-3 text-right">
                    <PaginationSummary pagination={pagination} />
                </span>
            </div>
        );
    }
}
