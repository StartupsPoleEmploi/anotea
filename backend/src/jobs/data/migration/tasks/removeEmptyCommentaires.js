module.exports = async db => {
    return db.collection('comment').updateMany({ 'comment.title': '', 'comment.text': '' }, {
        $unset: {
            comment: 1,
        }
    });
};
