const request = require('supertest');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const readline = require('readline');
const assert = require('assert');
const createHMACSignature = require('../../../../../../src/jobs/data/auth/utils/createHMACSignature');
const { withServer } = require('../../../../../helpers/test-server');

describe('datalake-exporter', withServer(({ startServer, getComponents }) => {

    let tests = 0;
    const getFileContent = datalake => {
        return new Promise((resolve, reject) => {

            let lines = [];

            fs.readdir(datalake.path, (err, files) => {
                if (err) {
                    return reject(err);
                }

                let res = files.filter(f => f.startsWith(datalake.fileNamePrefix));
                assert.strictEqual(res.length, 1);

                let datalakeFile = path.join(datalake.path, files[0]);

                readline.createInterface({ input: fs.createReadStream(datalakeFile) })
                .on('line', line => lines.push(line))
                .on('close', () => resolve(lines));
            });
        });
    };

    it('should export log to datalake', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/authenticated')
        .set('authorization', createHMACSignature('esd', '1234', 'GET', '/api/v1/ping/authenticated'));

        let lines = await getFileContent(configuration.log.datalake);

        let line = JSON.parse(lines[tests++]);
        assert.ok(line.date);
        assert.ok(line.request.requestId);
        assert.deepStrictEqual(_.omit(line, ['date', 'request']), {
            apiVersion: 'v1',
            application: 'esd',
            response: {
                statusCode: 200
            }
        });
        assert.deepStrictEqual(_.omit(line.request, ['requestId']), {
            widget: false,
        });
    });

    it('should export log to datalake (widget)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/anonymous')
        .set('X-Anotea-Widget', 'http://test.com');

        let lines = await getFileContent(configuration.log.datalake);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.application, 'test.com');
        assert.strictEqual(line.request.widget, true);
    });

    it('should export log to datalake (widget invalid referrer)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/anonymous')
        .set('X-Anotea-Widget', 'INVALID');

        let lines = await getFileContent(configuration.log.datalake);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.application, 'public');
        assert.strictEqual(line.request.widget, true);
    });

    it('should export log to datalake (error)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/error');

        let lines = await getFileContent(configuration.log.datalake);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.response.statusCode, 500);
    });

}));

