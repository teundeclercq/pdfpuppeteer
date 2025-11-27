const path = require('path');
const request = require('supertest');

// Set SHARED_SECRET before requiring the app
process.env.SHARED_SECRET = 'test-secret';

const app = require('../app');

describe('PDF generation API', () => {
    const sampleHtmlPath = path.join(__dirname, 'fixtures', 'sample.html');

    it('returns a valid PDF when given a valid HTML file and correct secret', async () => {
        const res = await request(app)
            .post('/pdf')
            .set('x-shared-secret', 'test-secret')
            .attach('file', sampleHtmlPath);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('application/pdf');
        expect(res.headers['content-disposition']).toContain('attachment');

        // Supertest should give us a Buffer as body for binary content
        expect(Buffer.isBuffer(res.body)).toBe(true);

        // Check that PDF starts with "%PDF"
        const magic = res.body.toString('ascii', 0, 4);
        expect(magic).toBe('%PDF');
    });

    it('returns 401 when secret is missing or wrong', async () => {
        const res = await request(app)
            .post('/pdf')
            // no x-shared-secret header
            .attach('file', sampleHtmlPath);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('returns 400 when file is missing', async () => {
        const res = await request(app)
            .post('/pdf')
            .set('x-shared-secret', 'test-secret');

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty(
            'error',
            'No HTML file uploaded. Use field name "file".'
        );
    });
});