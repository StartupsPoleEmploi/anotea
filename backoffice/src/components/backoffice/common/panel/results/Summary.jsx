import React from 'react';
import PropTypes from 'prop-types';
import './Summary.scss';

export default class Summary extends React.Component {

    static propTypes = {
        pagination: PropTypes.object.isRequired,
        paginationLabel: PropTypes.node.isRequired,
        title: PropTypes.node,
    };

    getPaginationData = () => {

        let { paginationLabel } = this.props;
        let { totalItems, itemsOnThisPage } = this.props.pagination;

        return (
            <div className="pages col-sm-3 text-right">
                <span>{itemsOnThisPage} {paginationLabel} affiché(s) sur {totalItems}</span>
            </div>
        );
    };

    render() {
        let { pagination, title } = this.props;

        return (
            <div className="Summary row">
                <div className="offset-md-1 col-sm-7">
                    {title || <div/>}
                </div>
                {pagination.totalItems > 0 && this.getPaginationData()}
            </div>
        );
    }
}
