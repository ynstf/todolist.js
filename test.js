// test.js
const request = require('supertest');
const app = require('./server'); // Assuming your server file is named 'server.js'

describe('Testing /test endpoint', () => {
    it('should return a message "Hello, World!"', async () => {
    const response = await request(app).get('/test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Hello, World!' });
    });
});
