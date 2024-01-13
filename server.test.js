const request = require('supertest');
const { app, closeServer } = require('./server');

describe('Testing /test endpoint', () => {
    it('should return a message "Hello, World!"', async () => {
        const response = await request(app).get('/test');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Hello, World!');
    });

    afterAll(() => {
        closeServer();
    });
});
