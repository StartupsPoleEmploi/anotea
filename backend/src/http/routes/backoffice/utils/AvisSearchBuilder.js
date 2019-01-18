class AvisSearchBuilder {

    constructor(db, itemsPerPage, codeRegion) {
        this.db = db;
        this.limit = itemsPerPage;
        this.projection = {};
        this.sort = { date: 1 };
        this.skip = 0;
        this.query = {
            step: { $gte: 2 },
            codeRegion: codeRegion,
        };
    }

    withComment() {
        this.query.comment = { $ne: null };
    }

    withFilter(filter) {
        if (filter === 'reported') {
            this.query.reported = true;
        } else if (filter === 'rejected') {
            this.query.rejected = true;
        } else if (filter === 'published') {
            this.query.published = true;
        } else if (filter === 'toModerate') {
            this.query.moderated = { $ne: true };
        }

        if (filter !== 'all') {
            this.withComment();
        }
        this.sort = filter === 'all' ? { date: -1 } : { lastModerationAction: 1 };
    }

    async withEmail(email) {

        let results = await this.db.collection('trainee')
        .find({ 'trainee.email': email })
        .project({ token: 1 })
        .toArray();

        let tokens = results.map(s => s.token);
        this.query.token = { $in: tokens };
    }

    withFullText(query) {
        this.query.$text = { $search: query };
        this.projection = { score: { $meta: 'textScore' } };
        this.sort = { score: { $meta: 'textScore' } };
    }

    page(page) {
        this.skip = (page || 0) * this.limit;
    }

    search() {
        return this.db.collection('comment')
        .find(this.query)
        .project(this.projection)
        .sort(this.sort)
        .skip(this.skip)
        .limit(this.limit);
    }
}

module.exports = AvisSearchBuilder;
