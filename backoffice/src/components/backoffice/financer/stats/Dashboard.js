import React from 'react';
import PropTypes from 'prop-types';
import Graph from './Graph';
import Table from './Table';
import moment from 'moment';

import './dashboard.css';

const CURRENT_YEAR = new Date().getFullYear();

export default class DashBoard extends React.Component {

    state = {
        type: 0,
        year: CURRENT_YEAR
    }

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);

        this.state.today = moment().format('DD MMMM YYYY');
    }

    onChangeType = type => this.setState({ type: type });

    getTitle = () => {
        return `Statistiques au ${this.state.year === CURRENT_YEAR ? this.state.today : `31 décembre ${this.state.year}`}`;
    }

    goToYear = cursor => {
        this.setState({ year: this.state.year + cursor });
    }

    render() {
        return (
            <div>
                <h2>
                    <i className="fas fa-chevron-left goToYear" onClick={this.goToYear.bind(this, -1)} />
                    
                    {this.getTitle()}

                    { this.state.year < CURRENT_YEAR &&
                        <i className="fas fa-chevron-right goToYear" onClick={this.goToYear.bind(this, 1)} />
                    }
                </h2>
                <div className="row">
                    <div className="col-md-6">
                        <Table codeFinanceur={this.props.codeFinanceur} codeRegion={this.props.codeRegion} changeType={this.onChangeType} type={this.state.type} year={this.state.year} />
                    </div>
                    <div className="col-md-6">
                        <Graph codeFinanceur={this.props.codeFinanceur} codeRegion={this.props.codeRegion} type={this.state.type} year={this.state.year} />
                    </div>
                </div>
            </div>
        );
    }
}