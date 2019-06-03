import React, { Component } from 'react';
import './StatsTable.scss';

export default class OrganismesStatsTable extends Component {

    render() {

        return (
            <div className="container table-responsive">
                <table className="table">
                    <thead>
                        <tr className="table-colspan">
                            {this.props.variant.map( e => (
                                <th key={e.id} colSpan={e.value}>{e.title}</th>
                            ))}
                        </tr>
                        <tr>
                            {this.props.columnsTitle.map( title => (
                                <th key={title.id} scope="col">{title.value}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">PACA</th>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                        </tr>
                        <tr>
                            <th scope="row">HDF</th>
                            <td>653</td>
                            <td>12166</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                        </tr>
                        <tr>
                            <th scope="row">VDL</th>
                            <td>888</td>
                            <td>12188</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
