import React from 'react';
import PropTypes from 'prop-types';

import './sideMenu.css';

export default class SideMenu extends React.PureComponent {

    state = {
        currentPage: 'advices',
        features: []
    };

    static propTypes = {
        onChangePage: PropTypes.func.isRequired,
        features: PropTypes.string.isRequired
    };

    changePage = page => {
        this.setState({ currentPage: page });
        this.props.onChangePage(page);
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.features) {
            this.setState({ features: nextProps.features });
        }
    }

    render() {
        return (
            <div className="sideMenu">
                <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                        Menu
                        <span className="caret"></span>
                    </button>
                    <div className="dropdown-menu">
                        <button className={`"dropdown-item ${this.state.currentPage === 'advices' ? 'active' : ''}`}
                                onClick={this.changePage.bind(this, 'advices')}>Avis
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
