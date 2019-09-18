import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Pie as PP } from '@nivo/pie';
import AutoSizer from 'react-virtualized-auto-sizer';

let round = value => Number(Math.round(value + 'e1') + 'e-1');

const Pie = ({ data }) => {

    let total = _.sumBy(data, d => d.value);

    return (
        <div style={{ height: '130px' }}>
            <AutoSizer>
                {({ height, width }) => {

                    let legend = {
                        anchor: 'right',
                        direction: 'column',
                        itemWidth: 80,
                        itemHeight: 18,
                        translateX: 80,
                    };

                    return (
                        <PP
                            data={data}
                            height={height}
                            width={width}
                            margin={{
                                top: 20,
                                right: 100,
                                bottom: 20,
                                left: 10,
                            }}
                            legends={[legend]}
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

        </div>
    );
};

Pie.propTypes = {
    data: PropTypes.array.isRequired,
};

export default Pie;
