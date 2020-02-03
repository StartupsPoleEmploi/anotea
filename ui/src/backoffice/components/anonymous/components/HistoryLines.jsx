import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { ResponsiveLine } from '@nivo/line';

export default class HistoryLines extends React.Component {

    static propTypes = {
        lines: PropTypes.array.isRequired,
        colors: PropTypes.array,
        groupBy: PropTypes.string,
        format: PropTypes.func,
    };

    static defaultProps = {
        format: v => `${v}`,
    };

    render() {

        let { lines, groupBy, format, colors } = this.props;

        return (
            <ResponsiveLine
                data={lines}
                margin={{ top: 10, right: 10, bottom: 120, left: 60 }}
                xScale={{
                    type: 'time',
                    format: '%Y-%m-%dT%H:%M:%S.%L', //parsed by d3-time-format lib
                    precision: 'day',
                }}

                axisBottom={{
                    format: v => groupBy === 'month' ? moment(v).format('MMMM YYYY') : moment(v).format('YYYY-MM-DD'),
                    tickValues: `every 1 ${groupBy || 'week'}s`
                }}
                axisLeft={{
                    format: format,
                    tickValues: 5
                }}
                curve="monotoneX"
                enableSlices="x"
                sliceTooltip={({ slice }) => {
                    return (
                        <div
                            style={{
                                background: 'white',
                                padding: '9px 12px',
                                border: '1px solid #ccc',
                            }}
                        >
                            {slice.points.map(point => {
                                return (
                                    <div
                                        key={point.id}
                                        style={{
                                            color: point.serieColor,
                                            padding: '3px 0',
                                        }}
                                    >
                                        <strong>{point.serieId}</strong> {format(point.data.yFormatted)}
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
                colors={colors || { scheme: 'nivo' }}
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
                        itemWidth: 170,
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
