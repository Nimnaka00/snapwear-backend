const request = require('supertest');
const app = require('../server');

describe('Auth + Product API', () => {
  let token;
  let createdProductId;
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'test1234';

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: "Test",
      lastName: "User",
      email: testEmail,
      password: testPassword
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  }, 15000);

  it('should login successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword
    });
    expect(res.statusCode).toBe(200);
    token = res.body.token;
  }, 15000);

  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 15000);

  it('should add a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: "Test Shirt",
        price: 2999,
        imageUrl: "https://example.com/test-shirt.png",
        category: "Men"
      });

    expect(res.statusCode).toBe(201);
    createdProductId = res.body._id;
  }, 15000);

  it('should update the product', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 3499 });

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(3499);
  }, 15000);

  it('should delete the product', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  }, 15000);
});
