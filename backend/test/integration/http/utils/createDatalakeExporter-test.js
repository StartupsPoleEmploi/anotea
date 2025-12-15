const request = require('supertest');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const readline = require('readline');
const assert = require('assert');
const buildHMACSignature = require('../../../../src/jobs/data/auth/utils/buildHMACSignature');
const { withServer } = require('../../../helpers/with-server');

describe('datalake-exporter', withServer(({ startServer, getComponents }) => {

    let tests = 0;
    const getFileContent = async configuration => {

        let datalakeFileName = `statsesd_${configuration.log.datalake.fileNamePrefix}.log`;
        let datalakeFile = path.join(configuration.log.datalake.path, datalakeFileName);

        await new Promise(resolve => {
            const timeout = setInterval(() => {
                const exists = fs.existsSync(datalakeFile);
                if (exists) {
                    clearInterval(timeout);
                    resolve();
                }
            }, 10);
        });

        return new Promise(resolve => {

            let lines = [];

            readline.createInterface({ input: fs.createReadStream(datalakeFile) })
            .on('line', line => lines.push(line))
            .on('close', () => resolve(lines));
        });
    };

    it('should export log to datalake', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/authenticated')
        .set('authorization', buildHMACSignature('esd', '1234', { method: 'GET', path: '/api/v1/ping/authenticated' }))
        .set('x-real-ip', '192.0.0.1')
        .set('referer', 'http://www.la-bonne-formation.fr')
        .set('User-Agent', 'node-superagent-test/1.0');

        let lines = await getFileContent(configuration);

        let line = JSON.parse(lines[tests++]);
        assert.ok(line.date);
        assert.ok(line.requestId);
        assert.ok(line.httpUserAgent.startsWith('node-superagent'));
        assert.deepStrictEqual(_.omit(line, ['date', 'requestId', 'httpUserAgent']), {
            startup: 'anotea',
            remoteIP: '192.0.0.1',
            httpReferer: 'http://www.la-bonne-formation.fr',
            status: 200,
            apiVersion: 'v1',
            widget: false,
            application: 'esd',
        });
    });

    it('should export log to datalake (widget)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/anonymous')
        .set('X-Anotea-Widget', 'http://test.com');

        let lines = await getFileContent(configuration);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.application, 'test.com');
        assert.strictEqual(line.widget, true);
    });

    it('should export log to datalake (widget invalid referrer)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/anonymous')
        .set('X-Anotea-Widget', 'INVALID');

        let lines = await getFileContent(configuration);

        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.application, 'unknown');
        assert.strictEqual(line.widget, true);
    });

    it('should export log to datalake (error)', async () => {

        let app = await startServer();
        let { configuration } = await getComponents();

        await request(app)
        .get('/api/v1/ping/error');

        let lines = await getFileContent(configuration);


        let line = JSON.parse(lines[tests++]);
        assert.strictEqual(line.status, 500);
    });

}));

