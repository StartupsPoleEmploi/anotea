import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Pie as NoResponsivePie } from '@nivo/pie';
import AutoSizer from 'react-virtualized-auto-sizer';
import './Pie.scss';

let round = value => Number(Math.round(value + 'e1') + 'e-1');

const Pie = ({ data, colors }) => {

    let total = _.sumBy(data, d => d.value);
    let prettyLabel = element => `(${round((element.datum.value / total) * 100)}%)`;

    return (
        <div className="Pie">
            {total === 0 ? <div className="empty">Pas de résultats</div> :
                <AutoSizer>
                    {({ height, width }) => {

                        return (
                            <NoResponsivePie
                                data={data}
                                height={height}
                                width={width}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                                isInteractive={false}
                                enableSlicesLabels={false}
                                theme={{ fontSize: 12, fontFamily: 'Lato', textColor: '#24303A' }}
                                colors={colors || { scheme: 'nivo' }}
                                radialLabelsTextXOffset={5}
                                radialLabelsLinkDiagonalLength={10}
                                radialLabelsLinkHorizontalLength={5}
                                radialLabelsSkipAngle={25}
                                radialLabel={element => prettyLabel(element)}
                                tooltip={element => {
                                    return (
                                        <div style={{ fontSize: '10px' }}>
                                            {element.value} {prettyLabel(element)}
                                        </div>
                                    );
                                }}
                            />);
                    }}
                </AutoSizer>
            }
        </div>
    );
};

Pie.propTypes = {
    data: PropTypes.array.isRequired,
    colors: PropTypes.array,
};

export default Pie;
