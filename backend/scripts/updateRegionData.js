db.trainee.update({}, { $set: { codeRegion: '11' } }, { multi: true });
db.comment.update({}, { $set: { codeRegion: '11' } }, { multi: true });
