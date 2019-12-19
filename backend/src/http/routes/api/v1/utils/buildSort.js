module.exports = ({ tri, ordre }) => {
    let field;
    switch (tri) {
        case 'notes':
            field = 'rates.global';
            break;
        case 'formation':
            field = 'training.title';
            break;
        default:
            field = 'date';
    }
    return { [field]: ordre === 'asc' ? 1 : -1 };
};
