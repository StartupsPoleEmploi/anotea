import React from 'react';
import PropTypes from 'prop-types';
import './Pagination.scss';
import AnalyticsContext from '../../../../../../common/components/analytics/AnalyticsContext';

export default class Pagination extends React.Component {

    static contextType = AnalyticsContext;

    static propTypes = {
        pagination: PropTypes.object.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    onClick(e, page) {
        let { trackClick } = this.context;

        e.preventDefault();
        trackClick('pagination');
        this.props.onClick(page - 1);
    }

    render() {
        let currentPage = this.props.pagination.page + 1;
        let totalPages = this.props.pagination.totalPages;
        let previousPage = currentPage - 1;
        let nextPage = currentPage + 1;
        let lastPage = totalPages;
        let isFirstPage = currentPage === 1;
        let isLastPage = currentPage === lastPage;
        let showPrevious = currentPage > 2;

        if (totalPages <= 1) {
            return (<ul className="Pagination" />);
        }

        return (
            <div className="Pagination row">
                <div className="offset-4 col-4 d-flex justify-content-center">
                    <ul className="pagination">
                        <li className={`page-item ${isFirstPage ? 'active' : ''}`}>
                            <a href="/#" className="page-link" onClick={e => this.onClick(e, 1)} aria-label="page 1">1</a>
                        </li>
                        {
                            (totalPages > 5 && currentPage > 3) &&
                            <li className="page-item disabled" aria-hidden="true">
                                <p className="page-link">...</p>
                            </li>
                        }
                        {
                            showPrevious &&
                            <li className="page-item">
                                <a
                                    href="/#"
                                    className="page-link"
                                    onClick={e => this.onClick(e, previousPage)}
                                    aria-label={`page ${previousPage}`}>{previousPage}
                                </a>
                            </li>
                        }
                        {
                            (!isFirstPage && !isLastPage) &&
                            <li className="page-item active">
                                <a
                                    href="/#"
                                    className="page-link"
                                    onClick={e => this.onClick(e, currentPage)}
                                    aria-label={`page ${currentPage}`}>{currentPage}
                                </a>
                            </li>
                        }
                        {
                            (nextPage < lastPage) &&
                            <li className="page-item">
                                <a href="/#" className="page-link" onClick={e => this.onClick(e, nextPage)}
                                aria-label={`page ${nextPage}`}>{nextPage}</a>
                            </li>
                        }
                        {
                            (currentPage < totalPages - 2) &&
                            <li className="page-item disabled" aria-hidden="true">
                                <p className="page-link">...</p>
                            </li>
                        }
                        <li className={`page-item ${isLastPage && 'active'}`}>
                            <a href="/#" className="page-link" onClick={e => this.onClick(e, lastPage)}
                            aria-label={`page ${lastPage}`}>{lastPage}</a>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
