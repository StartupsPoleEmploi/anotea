module.exports = fields => {
    if (fields) {
        return fields.reduce((acc, field) => {
            if (field.startsWith("-")) {
                let fieldName = field.substring(1, field.length);
                acc[fieldName] = 0;
            } else {
                acc[field] = 1;
            }
            return acc;
        }, {});
    }
    return {};
};
