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
        index: 0,
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

    onChangeType = (type, index) => this.setState({ type: type, index: index });

    getTitle = () => {
        if (this.state.year !== 'TOTAL') {
            return `Statistiques ${this.state.year} : cumul au ${this.state.year === CURRENT_YEAR ? moment().format('DD/MM/YY') : '31/12/' + this.state.year}`;
        } else {
            return 'Statistiques cumulées';
        }
    }

    goToNextYear = () => {
        this.setState({ year: this.state.year === CURRENT_YEAR ? 'TOTAL' : this.state.year + 1 });
    }

    goToPreviousYear = () => {
        this.setState({ year: this.state.year === 'TOTAL' ? CURRENT_YEAR : this.state.year - 1 });
    }

    render() {
        return (
            <div>
                <h2>
                    <i className="fas fa-chevron-left goToYear" onClick={this.goToPreviousYear} />
                    
                    {this.getTitle()}

                    { this.state.year !== 'TOTAL' &&
                        <i className="fas fa-chevron-right goToYear" onClick={this.goToNextYear} />
                    }
                </h2>
                <div className="row">
                    <div className="col-md-6">
                        <Table codeFinanceur={this.props.codeFinanceur} codeRegion={this.props.codeRegion} changeType={this.onChangeType} type={this.state.type} index={this.state.index} year={this.state.year} />
                    </div>
                    <div className="col-md-6">
                        <Graph codeFinanceur={this.props.codeFinanceur} codeRegion={this.props.codeRegion} type={this.state.type} year={this.state.year} />
                    </div>
                </div>
            </div>
        );
    }
}