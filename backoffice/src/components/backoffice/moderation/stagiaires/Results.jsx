import React from 'react';
import PropTypes from 'prop-types';
import Avis from './avis';
import { Pagination, PaginationStatus } from '../../common/Pagination';
import './Results.scss';

const Description = ({ results, filter }) => {

    let suffixMapper = {
        'all': '',
        'published': 'publiés',
        'rejected': 'rejetés',
        'reported': 'signalés',
        'toModerate': 'à modérer',
    };


    //FIXME backend must return total elements
    if (results.avis.length === 0) {
        return (<p className="description">Pas d'avis pour le moment</p>);
    }

    return (
        <p className="description">
            <span className="name">Liste des avis</span>
            <span className="suffix"> {filter === 'all' ? '' : suffixMapper[filter]}</span>
            <span className="status d-none d-sm-block"><PaginationStatus pagination={results} /></span>
        </p>
    );
};
Description.propTypes = { results: PropTypes.object.isRequired, filter: PropTypes.string.isRequired };

export default class Results extends React.Component {

    static propTypes = {
        results: PropTypes.object.isRequired,
        filter: PropTypes.string.isRequired,
        search: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className="Results">
                <Description results={this.props.results} filter={this.props.filter} />
                {
                    this.props.results.avis
                    .filter(advice => advice.comment)
                    .map((avis, key) => {
                        return (
                            <div key={key}>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Avis avis={avis} onChange={() => this.props.search({ silent: true })} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
                {this.props.results.pageCount > 1 &&
                <div className="row justify-content-center">
                    <div className="col-4 d-flex justify-content-center">
                        <Pagination filter={this.props.filter} pagination={this.props.results} />
                    </div>
                </div>
                }
            </div>
        );
    }
}
