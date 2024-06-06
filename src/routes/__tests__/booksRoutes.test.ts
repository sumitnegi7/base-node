import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import bookRoutes from '../bookRoutes';
import { migrate, clearDB } from '../../database/mocks/db';
import { connectDB } from '../../database/db';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

const app = express();
app.use(bodyParser.json());
app.use('/api/books', bookRoutes);

beforeAll(async () => {
  await migrate(); // Migrate the test database
  await clearDB();
  await connectDB();
});

const generateToken = (role: string) => {
  return jwt.sign({ id: 100, role }, config.secret, { expiresIn: '1h' });
};

describe('Book Routes', () => {
  const adminToken = `Bearer ${generateToken('admin')}`;
  const memberToken = `Bearer ${generateToken('member')}`;

  it('should add a new book', async () => {
    const response = await request(app).post('/api/books').set('Authorization', adminToken).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '1234567891',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Book added successfully');
  });

  it('should not allow a member to add a book', async () => {
    const response = await request(app).post('/api/books').set('Authorization', memberToken).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '1234567895',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });

    expect(response.status).toBe(403);
  });

  it('should update a book', async () => {
    // First add a book
    const res = await request(app).post('/api/books').set('Authorization', adminToken).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '1234567844',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });

    const response = await request(app).put(`/api/books/${res.body.data.id}`).set('Authorization', adminToken).send({
      title: 'Updated Test Book',
      author: 'Updated Test Author',
      ISBN: '1234567844',
      publishedYear: 2023,
      quantity: 15,
      status: 'available',
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Book updated successfully');
  });

  it('should delete a book', async () => {
    // First add a book
    const res = await request(app).post('/api/books').set('Authorization', adminToken).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '1234567',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });
    const response = await request(app).delete(`/api/books/${res.body.data.id}`).set('Authorization', adminToken);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Book deleted successfully');
  });

  it('should fetch all books', async () => {
    const response = await request(app).get('/api/books').set('Authorization', adminToken);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Book details fetched successfully');
  });
});
