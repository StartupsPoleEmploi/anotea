export default (dividend, divisor) => {
    if (dividend && divisor !== 0) {
        return (Math.round((dividend * 100) / divisor) + '%');
    } else {
        return (0 + '%');
    }
};
