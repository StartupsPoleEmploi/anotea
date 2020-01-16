import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveLine } from '@nivo/line';

export default class HistoryLines extends React.Component {

    static propTypes = {
        data: PropTypes.array.isRequired,
        colors: PropTypes.array,
    };

    render() {

        return (
            <ResponsiveLine
                data={this.props.data}
                margin={{ top: 10, right: 10, bottom: 120, left: 60 }}
                xScale={{
                    type: 'time',
                    format: '%Y-%m-%dT%H:%M:%S.%LZ',
                    precision: 'day',
                }}
                xFormat="time:%Y-%m-%d"
                axisBottom={{
                    format: '%d-%m-%Y',
                    tickValues: 'every 1 months',
                }}
                axisLeft={{
                    //format: v => `${v / 1000}k`,
                    tickValues: 5
                }}
                curve="monotoneX"
                enableSlices={'x'}
                colors={this.props.colors || { scheme: 'nivo' }}
                enableGridX={false}
                pointSize={5}
                legends={[
                    {
                        anchor: 'bottom-left',
                        direction: 'row',
                        justify: false,
                        translateY: 70,
                        itemsSpacing: 10,
                        itemDirection: 'left-to-right',
                        itemWidth: 120,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemBackground: 'rgba(0, 0, 0, .03)',
                                    itemOpacity: 1
                                }
                            }
                        ]

                    }
                ]}
            />
        );
    }
}
