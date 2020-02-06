import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { ResponsiveLine } from '@nivo/line';
import { divide } from '../../../utils/number-utils';

export const convertToRatioLine = (stats, type, path1, path2, options = {}) => {

    let values = _.cloneDeep(stats);
    let getValue = (data, path) => _.get(data, `${type}.${path}`, 0);

    return {
        id: type.charAt(0).toUpperCase() + type.slice(1),
        data: values
        .reverse()
        .map((current, index) => {
            //diff
            let date = current.date;
            let previous = values[index - 1];

            return {
                date,
                [path1]: getValue(current, path1) - getValue(previous, path1),
                [path2]: getValue(current, path2) - getValue(previous, path2),
            };
        })
        .reduce((acc, bucket) => {
            //group
            let selector = moment(bucket.date).startOf(options.groupBy || 'months').format('YYYY-MM-DDTHH:mm:ss.SSS');
            let group = acc.find(v => v.date === selector);
            if (!group) {
                group = {
                    date: selector,
                    [path1]: 0,
                    [path2]: 0,
                };
                acc.push(group);
            }

            group[path1] += bucket[path1];
            group[path2] += bucket[path2];

            return acc;

        }, [])
        .filter(b => b[path2] > 0)// Ignore bucket
        .slice(0, -1)// Drop last bucket
        .map(bucket => {
            return {
                x: bucket.date,
                y: divide(bucket[path1] * 100, bucket[path2]),
                tooltip: options.tooltip ? options.tooltip(bucket[path1]) : bucket[path1],
            };
        }),
    };
};

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
                margin={{ top: 10, right: 40, bottom: 80, left: 40 }}
                xScale={{
                    type: 'time',
                    format: '%Y-%m-%dT%H:%M:%S.%L', //parsed by d3-time-format lib
                    //precision: 'day',
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
                                let data = point.data;
                                return (
                                    <div key={point.id} style={{ color: point.serieColor, padding: '3px 0' }}>
                                        <span>{data.tooltip}</span>
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
                        itemWidth: 70,
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
