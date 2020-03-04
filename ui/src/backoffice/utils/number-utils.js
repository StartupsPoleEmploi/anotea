const numeral = require('numeral');
numeral.register('locale', 'fr', {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal: number => number === 1 ? 'er' : 'ème',
    currency: {
        symbol: '€'
    }
});
numeral.locale('fr');


export const formatNumber = (value, suffix) => {
    return `${numeral(value).format('0,0')}${suffix || ''}`;
};

export const divide = (dividend, divisor) => {
    if (dividend && divisor !== 0) {
        let value = dividend / divisor;
        return Number(Math.round(value + 'e1') + 'e-1');
    } else {
        return 0;
    }
};
export const percentage = (dividend, divisor) => {
    return divide(dividend * 100, divisor);
};
