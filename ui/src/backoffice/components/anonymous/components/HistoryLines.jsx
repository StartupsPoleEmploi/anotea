import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { ResponsiveLine } from '@nivo/line';
import { divide } from '../../../utils/number-utils';

const style = `
.collapsible {
  background-color: #777;
  color: white;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}

.active, .collapsible:hover {
  background-color: #555;
}

.content {
  padding: 0 18px;
  display: none;
  overflow: hidden;
  background-color: #f1f1f1;
}
`;

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
                bucket,
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
        formatTooltip: PropTypes.func,
    };

    static defaultProps = {
        format: v => `${v}`,
        formatTooltip: b => `${b}`,
    };

    componentDidMount() {
        let coll = document.getElementsByClassName("collapsible");
        let i;

        for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
                this.classList.toggle("active");
                let content = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            });
        }
    }

    render() {

        let { lines, groupBy, format, formatTooltip, colors } = this.props;

        const customTheme = {
            grid: {
                line: {
                    stroke: "rgb(0,0,0)",
                }
            },
            axis: {
                ticks: {
                    text: {
                        fill: "rgb(0, 0, 0)",
                    },
                },
            },
        };

        const isJanvierOuJuillet = (value) => moment(value).month() % 6 === 0;
        return (
            <>
                <style>{style}</style>
                <ResponsiveLine
                    data={lines}
                    margin={{ top: 10, right: 40, bottom: 80, left: 40 }}
                    xScale={{
                        type: 'time',
                        format: '%Y-%m-%dT%H:%M:%S.%L', //parsed by d3-time-format lib
                        //precision: 'day',
                    }}
                    axisBottom={{
                        format: v => groupBy === 'month' ? (isJanvierOuJuillet(v) ? moment(v).format('MM/YY') : "") : moment(v).format('YYYY-MM-DD'),
                        tickValues: `every 1 ${groupBy || 'week'}s`
                    }}
                    axisLeft={{
                        format: format,
                        tickValues: 5
                    }}
                    curve="monotoneX"
                    enableSlices={'x'}
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
                                            <span>{formatTooltip(data)}</span>
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
                    theme={customTheme}
                />
                <p>Collapsible Set:</p>
                <button type="button" class="collapsible">Open Section 1</button>
                <div class="content">
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </div>
                <button type="button" class="collapsible">Open Section 2</button>
                <div class="content">
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </div>
                <button type="button" class="collapsible">Open Section 3</button>
                <div class="content">
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </div>
                {console.log(lines[0].data[0].bucket.date.split("-")[1])}
                {console.log(lines[0].data[0].bucket['avis.nbAvis'])}
                
            </>
        );
    }
}
