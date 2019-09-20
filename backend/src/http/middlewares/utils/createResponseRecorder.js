module.exports = (options = {}) => {
    let chunks = [];
    let size = 0;

    let record = chunk => {
        if (options.mustRecordBody) {
            chunks.push(chunk);
        }
        size += chunk.byteLength;
    };

    return {
        record: res => {
            let write = res.write;
            res.write = chunk => {
                record(chunk);
                write.apply(res, [chunk]);
            };

            let end = res.end;
            res.end = chunk => {
                if (chunk) {
                    record(chunk);
                }
                end.apply(res, [chunk]);
            };
        },
        getBody: () => {
            if (!options.mustRecordBody) {
                return null;
            }

            try {
                return JSON.parse(Buffer.concat(chunks).toString('utf8'));
            } catch (e) {
                return chunks;
            }
        },
        getSize: () => {
            return size;
        }
    };
};
