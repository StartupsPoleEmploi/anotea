class AvisSearchBuilder {

    constructor(db, codeRegion, itemsPerPage) {
        this.db = db;
        this.codeRegion = codeRegion;
        this.limit = itemsPerPage;
        this.projection = {};
        this.sort = { date: 1 };
        this.skip = 0;
        this.query = {
            step: { $gte: 2 },
            comment: { $ne: null },
            codeRegion: codeRegion,
        };
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

    sortBy(sort) {
        this.sort = sort === 'moderation' ? { lastModerationAction: -1 } : { date: 1 };
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
