import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ResponsivePie } from '@nivo/pie';

let round = value => Number(Math.round(value + 'e1') + 'e-1');

const Pie = ({ data }) => {

    let total = _.sumBy(data, d => d.value);

    return (
        <div style={{ height: '130px', width: '300px' }}>
            <ResponsivePie
                data={data}
                theme={{ fontSize: 14, fontFamily: 'Lato', textColor: '#24303A' }}
                radialLabelsTextXOffset={5}
                radialLabelsLinkDiagonalLength={10}
                radialLabelsLinkHorizontalLength={10}
                enableSlicesLabels={false}
                radialLabel={e => `${round((e.value / total) * 100)}%`}
                colors={['#007E54', '#E5F2ED', '#66B298']}
                margin={{
                    top: 15,
                    right: 100,
                    bottom: 15,
                    left: 0,
                }}
                legends={[
                    {
                        anchor: 'right',
                        direction: 'column',
                        itemWidth: 100,
                        itemHeight: 25,
                        translateX: 70,
                    }
                ]}
            />
        </div>
    );
};

Pie.propTypes = {
    data: PropTypes.array.isRequired,
};

export default Pie;
