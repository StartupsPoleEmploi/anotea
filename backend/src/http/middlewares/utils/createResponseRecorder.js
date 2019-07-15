module.exports = () => {
    let chunks = [];

    return {
        record: res => {
            let write = res.write;
            res.write = chunk => {
                chunks.push(chunk);
                write.apply(res, [chunk]);
            };

            let end = res.end;
            res.end = chunk => {
                if (chunk) {
                    chunks.push(chunk);
                }
                end.apply(res, [chunk]);
            };
        },
        getBody: () => {
            try {
                return JSON.parse(Buffer.concat(chunks).toString('utf8'));
            } catch (e) {
                return chunks;
            }
        },
    };
};
