import React from 'react';
import PropTypes from 'prop-types';
import './Pagination.scss';

export default class Pagination extends React.Component {

    static propTypes = {
        pagination: PropTypes.object.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    onClick(page) {
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
                            <a className="page-link" onClick={() => this.onClick(1)}>1</a>
                        </li>
                        {
                            (totalPages > 5 && currentPage > 3) &&
                            <li className="page-item disabled">
                                <a className="page-link" href="#">...</a>
                            </li>
                        }
                        {
                            showPrevious &&
                            <li className="page-item">
                                <a
                                    className="page-link"
                                    onClick={() => this.onClick(previousPage)}>{previousPage}
                                </a>
                            </li>
                        }
                        {
                            (!isFirstPage && !isLastPage) &&
                            <li className="page-item active">
                                <a
                                    className="page-link"
                                    onClick={() => this.onClick(currentPage)}>{currentPage}
                                </a>
                            </li>
                        }
                        {
                            (nextPage < lastPage) &&
                            <li className="page-item">
                                <a className="page-link" onClick={() => this.onClick(nextPage)}>{nextPage}</a>
                            </li>
                        }
                        {
                            (currentPage < totalPages - 2) &&
                            <li className="page-item disabled">
                                <a className="page-link" href="#">...</a>
                            </li>
                        }
                        <li className={`page-item ${isLastPage && 'active'}`}>
                            <a className="page-link" onClick={() => this.onClick(lastPage)}>{lastPage}</a>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
