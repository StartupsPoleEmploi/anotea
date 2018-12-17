import React from 'react';
import PropTypes from 'prop-types';
import Graph from './Graph';
import Table from './Table';

export default class DashBoard extends React.Component {

    state = {
        type: 0
    }

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
    }

    onChangeType = type => this.setState({ type: type });

    render() {
        return (
            <div className="row">
                <div className="col-md-6">
                    <Table codeFinanceur={this.props.codeFinanceur} codeRegion={this.props.codeRegion} changeType={this.onChangeType} type={this.state.type} />
                </div>
                <div className="col-md-6">
                    <Graph codeFinanceur={this.props.codeFinanceur} codeRegion={this.props.codeRegion} type={this.state.type} />
                </div>
            </div>
        );
    }
}