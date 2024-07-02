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

    renderYearContent(lines) {
        const mois = {
            "01": "janvier",
            "02": "février",
            "03": "mars",
            "04": "avril",
            "05": "mai",
            "06": "juin",
            "07": "juillet",
            "08": "août",
            "09": "septembre",
            "10": "octobre",
            "11": "novembre",
            "12": "décembre"
        };
        const years = {};
        lines[0].data.forEach(item => {
            const year = item.bucket.date.split("-")[0];
            if (!years[year]) {
                years[year] = {
                    national: [],
                    regional: []
                };
            }
            years[year].national.push(item);
        });
    
        if (lines.length > 1) {
            lines[1].data.forEach(item => {
                const year = item.bucket.date.split("-")[0];
                if (!years[year]) {
                    years[year] = {
                        national: [],
                        regional: []
                    };
                }
                years[year].regional.push(item);
            });
        }
    
        return Object.keys(years).map(year => (
            <div key={year} className="sr-only">
                <button type="button" className="collapsible">Ouvrir les données nationales de {year}</button>
                <div style={{ display: "none"}}>
                    {years[year].national.map((item, index) => (
                        <div key={index}>
                            <p>Date: {mois[item.bucket.date.split("-")[1]]}</p>
                            <p>Nombre d'avis: {item.bucket['avis.nbAvis']}</p>
                            <p>Nombre de stagiaire contactés: {item.bucket['avis.nbStagiairesContactes']}</p>
                            <p>Pourcentage: {((item.bucket['avis.nbAvis']/item.bucket['avis.nbStagiairesContactes'])*100).toFixed(2)}%</p>
                        </div>
                    ))}
                </div>
                {lines.length > 1 && (
                    <>
                    <button type="button" className="collapsible">Ouvrir les données régionales de {year}</button>
                    <div style={{ display: "none"}}>
                        {years[year].regional.map((item, index) => (
                            <div key={index}>
                                <p>Date: {mois[item.bucket.date.split("-")[1]]}</p>
                                <p>Nombre d'avis: {item.bucket['avis.nbAvis']}</p>
                                <p>Nombre de stagiaire contactés: {item.bucket['avis.nbStagiairesContactes']}</p>
                                <p>Pourcentage: {((item.bucket['avis.nbAvis']/item.bucket['avis.nbStagiairesContactes'])*100).toFixed(2)}%</p>
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>
        ));
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
                <>
                    <ResponsiveLine
                        aria-hidden="true"
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
                </>
                {this.renderYearContent(lines)}
            </>
        );
    }
}
