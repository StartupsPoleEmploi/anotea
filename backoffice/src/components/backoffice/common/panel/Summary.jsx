import React from 'react';
import PropTypes from 'prop-types';
import './Summary.scss';

export default class Summary extends React.Component {

    static propTypes = {
        pagination: PropTypes.object.isRequired,
        paginationLabel: PropTypes.node.isRequired,
        title: PropTypes.node.isRequired,
        empty: PropTypes.node.isRequired,
    };

    render() {
        let { pagination, paginationLabel, empty, title } = this.props;
        let { totalItems, itemsOnThisPage } = this.props.pagination;

        if (pagination.totalItems === 0) {
            return (<p className="Summary">{empty}</p>);
        }

        return (
            <div className="Summary row">
                <div className="offset-4 col-4 ">
                    {title}
                </div>

                <span className="pages col-sm-4 col-md-3 text-right">
                     <span>{itemsOnThisPage} {paginationLabel} affiché(s) sur {totalItems}</span>
                </span>
            </div>
        );
    }
}
