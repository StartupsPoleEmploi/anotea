import React from "react";
import PropTypes from "prop-types";
import "./Summary.scss";

export default class Summary extends React.Component {

    static propTypes = {
        title: PropTypes.node,
        pagination: PropTypes.object,
        paginationLabel: PropTypes.node,
        buttons: PropTypes.node,
    };

    render() {
        let { pagination, paginationLabel, title, buttons } = this.props;

        return (
            <div className="Summary row">
                <div className="offset-md-1 col-sm-6">
                    {title || <div />}
                </div>

                {pagination && pagination.totalItems > 0 &&
                <div className="pages col-sm-4 text-right">
                    <span
                        className="pr-3">{pagination.itemsOnThisPage} {paginationLabel} affiché(s) sur {pagination.totalItems}</span>
                    {buttons}
                </div>
                }
            </div>
        );
    }
}
