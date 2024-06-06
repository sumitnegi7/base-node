import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from '../authRoutes';
import { migrate } from '../../models/mocks/db';
import { connectDB } from '../../models/db';

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await migrate(); // Migrate the test database
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
    // expect(response.body).toHaveProperty('token');
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
});
