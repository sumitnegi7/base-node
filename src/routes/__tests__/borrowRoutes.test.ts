import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import borrowRoutes from '../borrowRoutes';
import bookRoutes from '../bookRoutes';
import { migrate, clearDB } from '../../database/mocks/db';
import { connectDB, getDB } from '../../database/db';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

const app = express();
app.use(bodyParser.json());
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);

beforeAll(async () => {
  await migrate(); // Migrate the test database
  await clearDB();
  await connectDB();
});

const generateToken = (role: string, id?: number) => {
  return jwt.sign({ id: id ?? 1, role }, config.secret, { expiresIn: '1h' });
};

describe('Borrow Routes', () => {
  const adminToken = (id?: number) => `Bearer ${generateToken('admin', id)}`;
  const memberToken = `Bearer ${generateToken('member')}`;

  it('should borrow a book', async () => {
    // Add a test book
    const db = await getDB();
    const username = 'testuserborrower';
    await db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, 'password123', 'admin']);

    const user = await db.get(`SELECT id from users where username = ?`, [username]);
    const addBookResponse = await request(app).post('/api/books').set('Authorization', adminToken(user.id)).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '12345678112',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });

    const bookId = addBookResponse.body.data.id;

    const response = await request(app)
      .post('/api/borrows/borrow')
      .set('Authorization', memberToken)
      .send({
        bookId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // One week from now
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Book borrowed successfully');
  });

  it('should return a book', async () => {
    // Add a test book
    const addBookResponse = await request(app).post('/api/books').set('Authorization', adminToken()).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '1234567890',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });

    const bookId = addBookResponse.body.data.id;

    // First borrow a book
    await request(app)
      .post('/api/borrows/borrow')
      .set('Authorization', memberToken)
      .send({
        bookId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    // Then return the same book
    const response = await request(app).post('/api/borrows/return').set('Authorization', memberToken).send({
      bookId,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Book returned successfully');
  });

  it('should not allow borrowing the same book twice', async () => {
    // Add a test book
    const addBookResponse = await request(app).post('/api/books').set('Authorization', adminToken()).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '12345678888',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });

    const bookId = addBookResponse.body.data.id;

    // First borrow a book
    await request(app)
      .post('/api/borrows/borrow')
      .set('Authorization', memberToken)
      .send({
        bookId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    // Try to borrow the same book again without returning it
    const response = await request(app)
      .post('/api/borrows/borrow')
      .set('Authorization', memberToken)
      .send({
        bookId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'You have already borrowed this book');
  });

  it('should fetch all overdue books', async () => {
    // Add a test book
    const addBookResponse = await request(app).post('/api/books').set('Authorization', adminToken()).send({
      title: 'Test Book',
      author: 'Test Author',
      ISBN: '1234562010',
      publishedYear: 2023,
      quantity: 10,
      status: 'available',
    });

    const bookId = addBookResponse.body.data.id;

    // Set up overdue borrow record
    const db = await getDB();
    await db.run(`INSERT INTO borrowers (userId, bookId, borrowDate, dueDate) VALUES (?, ?, ?, ?)`, [
      1,
      bookId,
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime(), // Two weeks ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(), // One week ago
    ]);

    const response = await request(app).get('/api/borrows/overdue-books').set('Authorization', adminToken());

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
