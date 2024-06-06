import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from '../authRoutes';
import { clearDB, migrate } from '../../database/mocks/db';
import { connectDB } from '../../database/db';

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await migrate(); // Migrate the test database
  await clearDB();
  await connectDB();
});

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'testuser113',
      password: 'password123',
      role: 'member',
    });

    expect(response.status).toBe(201);
  });

  it('should not register a user when username is invalid', async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 123,
      password: 'password123',
      role: 'member',
    });

    expect(response.status).toBe(400);
  });

  it('should login an existing user', async () => {
    // First register a user
    await request(app).post('/api/auth/register').send({
      username: 'testuser',
      password: 'password123',
      role: 'member',
    });

    // Then login with the same user
    const response = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should throw error when logging with incorrect password', async () => {
    // First register a user
    await request(app).post('/api/auth/register').send({
      username: 'testuser1',
      password: 'password123',
      role: 'member',
    });

    // Then login with the same user
    const response = await request(app).post('/api/auth/login').send({
      username: 'testuser1',
      password: 'password1234',
    });

    expect(response.status).toBe(401);
  });
});
