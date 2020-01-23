module.exports = ({ tri, ordre }) => {
    let field;
    switch (tri) {
        case 'notes':
            field = 'notes.global';
            break;
        case 'formation':
            field = 'formation.intitule';
            break;
        default:
            field = 'formation.action.session.periode.fin';
    }

    return { [field]: ordre === 'asc' ? 1 : -1 };
};
