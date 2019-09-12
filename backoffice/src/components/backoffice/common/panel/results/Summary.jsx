import React from 'react';
import PropTypes from 'prop-types';
import './Summary.scss';

export default class Summary extends React.Component {

    static propTypes = {
        pagination: PropTypes.object.isRequired,
        paginationLabel: PropTypes.node.isRequired,
        title: PropTypes.node,
        buttons: PropTypes.node,
    };

    render() {
        let { pagination, paginationLabel, title, buttons } = this.props;
        let { totalItems, itemsOnThisPage } = this.props.pagination;

        return (
            <div className="Summary row">
                <div className="offset-md-1 col-sm-6">
                    {title || <div />}
                </div>

                {pagination.totalItems > 0 &&
                <div className="pages col-sm-4 text-right">
                    <span className="pr-3">{itemsOnThisPage} {paginationLabel} affiché(s) sur {totalItems}</span>
                    {buttons}
                </div>
                }
            </div>
        );
    }
}
