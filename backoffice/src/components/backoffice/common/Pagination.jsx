import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import './Pagination.scss';

export class Pagination extends React.Component {

    static propTypes = {
        filter: PropTypes.string.isRequired,
        pagination: PropTypes.object.isRequired,
    };

    render() {
        let { page, pageCount } = this.props.pagination;
        let nextPage = page + 1;
        let lastPage = pageCount - 1;
        let isFirstPage = page === 1;
        let isLastPage = page === lastPage;
        let showPrevious = page > 2;
        let getRoute = p => `/admin/moderation/stagiaires/${this.props.filter}${'/' + p || ''}`;

        if (pageCount === 1) {
            return (<ul className="Pagination" />);
        }

        return (
            <ul className="Pagination pagination">
                <li className={`page-item ${isFirstPage ? 'active' : ''}`}>
                    <NavLink className="page-link" to={getRoute(1)}>1</NavLink>
                </li>
                {
                    (pageCount > 5 && page > 3) &&
                    <li className="page-item disabled">
                        <a className="page-link" href="#">...</a>
                    </li>
                }
                {
                    showPrevious &&
                    <li className="page-item">
                        <NavLink className="page-link" to={getRoute(page - 1)}>{page - 1}</NavLink>
                    </li>
                }
                {
                    (!isFirstPage && !isLastPage) &&
                    <li className="page-item active">
                        <NavLink className="page-link" to={getRoute(page)}>{page}</NavLink>
                    </li>
                }
                {
                    (nextPage !== lastPage) &&
                    <li className="page-item">
                        <NavLink className="page-link" to={getRoute(nextPage)}>{nextPage}</NavLink>
                    </li>
                }
                {
                    (page < pageCount - 2) &&
                    <li className="page-item disabled">
                        <a className="page-link" href="#">...</a>
                    </li>
                }
                <li className="page-item">
                    <NavLink className="page-link" to={getRoute(lastPage)}>{lastPage}</NavLink>
                </li>
            </ul>
        );
    }
}

export class PaginationStatus extends React.Component {

    static propTypes = {
        pagination: PropTypes.object.isRequired,
    };

    render() {
        let { elementsPerPage, elementsOnThisPage, pageCount } = this.props.pagination;
        let total = elementsPerPage * pageCount;
        return (
            <span>{elementsOnThisPage} avis affiché(s) sur {total}</span>
        );
    }
}

