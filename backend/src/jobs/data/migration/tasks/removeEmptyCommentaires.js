module.exports = async db => {
    return db.collection('comment').updateMany({ 'comment.title': '', 'comment.text': '' }, {
        $unset: {
            comment: 1,
            editedComment: 1,
            pseudo: 1,
            pseudoMasked: 1,
        }
    });
};
