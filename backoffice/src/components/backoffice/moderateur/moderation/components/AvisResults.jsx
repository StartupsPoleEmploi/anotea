import React from 'react';
import PropTypes from 'prop-types';
import Avis from './avis/Avis';
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
        let { options, results, refresh } = this.props;

        return (
            <div>
                {this.state.message &&
                <Message message={this.state.message} onClose={() => this.setState({ message: null })} />
                }
                {
                    results.avis.map((avis, key) => {
                        return (
                            <Avis
                                key={key}
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
                        );
                    })
                }
            </div>
        );
    }
}
