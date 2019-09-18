import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Pie as NoResponsivePie } from '@nivo/pie';
import AutoSizer from 'react-virtualized-auto-sizer';
import './Pie.scss';

let round = value => Number(Math.round(value + 'e1') + 'e-1');

const Pie = ({ data }) => {

    let total = _.sumBy(data, d => d.value);

    return (
        <div className="Pie" style={{ height: '130px' }}>
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
                                    right: 100,
                                    bottom: 20,
                                    left: 10,
                                }}
                                legends={[{
                                    anchor: 'right',
                                    direction: 'column',
                                    itemWidth: 80,
                                    itemHeight: 18,
                                    translateX: 80,
                                }]}
                                isInteractive={false}
                                enableSlicesLabels={false}
                                theme={{ fontFamily: 'Lato', textColor: '#24303A' }}
                                colors={['#007E54', '#E5F2ED', '#66B298']}
                                radialLabelsTextXOffset={5}
                                radialLabelsLinkDiagonalLength={10}
                                radialLabelsLinkHorizontalLength={10}
                                radialLabel={e => `${round((e.value / total) * 100)}%`}
                            />
                        );
                    }}
                </AutoSizer>
            }
        </div>
    );
};

Pie.propTypes = {
    data: PropTypes.array.isRequired,
};

export default Pie;
