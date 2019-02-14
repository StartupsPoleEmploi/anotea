import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '../../../common/Pagination';
import Avis from './avis';
import Message from '../../../common/Message';

export default class AvisResults extends React.Component {

    static propTypes = {
        results: PropTypes.object.isRequired,
        options: PropTypes.object.isRequired,
        refresh: PropTypes.func.isRequired,
        onNewQuery: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
        };
    }

    render() {
        let { options, results, onNewQuery, refresh } = this.props;

        return (
            <div>
                {this.state.message &&
                <Message message={this.state.message} onClose={() => this.setState({ message: null })} />
                }
                {
                    results.avis.map((avis, key) => {
                        return (
                            <div key={key} className="row">
                                <div className="col-sm-12">
                                    <Avis
                                        avis={avis}
                                        options={options}
                                        onChange={(avis, options = {}) => {
                                            let { message } = options;
                                            if (message) {
                                                this.setState({ message });
                                            }
                                            refresh({ keepFocus: !message });
                                        }}>
                                    </Avis>
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
