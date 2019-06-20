export default (dividend, divisor) => {
    if (dividend && divisor !== 0) {
        let value = (dividend * 100) / divisor;
        return Number(Math.round(value + 'e1') + 'e-1') + '%';
    } else {
        return 0 + '%';
    }
};
