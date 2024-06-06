import { Request, Response } from 'express';
import { getDB } from '../models/db';
import { borrowSchema, returnSchema } from '../validation/borrowValidation';

/**
 *  Status to 'available' seems not feasible as if there are multiple quantity
 *  it will causes consistency and borrowing problems i am using qty to loan books
 *  if qty===0 then only i am setting status to borrowed else the functionality
 *  wont work for books where qty is more than 1
 */
export const borrowBook = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = borrowSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  const { bookId, dueDate } = value;
  const userId = req.userId;
  const db = getDB();

  try {
    const activeTransaction = await db.get('SELECT 1 FROM sqlite_master WHERE type="table" AND name="sqlite_master";');

    if (activeTransaction) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
    await db.run('BEGIN TRANSACTION'); // Start the transaction

    const book = await db.get(`SELECT quantity, status FROM books WHERE id = ?`, [bookId]);
    if (!book || book.quantity === 0 || book.status === 'borrowed') {
      res.status(400).json({ error: 'Book not available' });
      await db.run('ROLLBACK');
      return;
    }

    const duplicateBorrower = await db.get(`SELECT id FROM borrowers WHERE userId = ? and bookId = ?`, [
      userId,
      bookId,
    ]);
    if (duplicateBorrower) {
      res.status(400).json({ error: 'You have already borrowed this book' });
      await db.run('ROLLBACK');
      return;
    }

    const borrowDate = new Date().toISOString();
    await db.run(`INSERT INTO borrowers (userId, bookId, borrowDate, dueDate) VALUES (?, ?, ?, ?)`, [
      userId,
      bookId,
      borrowDate,
      dueDate,
    ]);

    if (book.quantity === 1) {
      await db.run(`UPDATE books SET quantity = quantity - 1, status = 'borrowed' WHERE id = ?`, [bookId]);
    } else {
      await db.run(`UPDATE books SET quantity = quantity - 1 WHERE id = ?`, [bookId]);
    }

    await db.run('COMMIT'); // Commit the transaction
    res.status(201).json({ message: 'Book borrowed successfully' });
  } catch (err) {
    console.log('🚀 ~ borrowBook ~ err:', err);
    await db.run('ROLLBACK'); // Rollback the transaction on error
    res.status(500).json({ error: err.message });
  }
};

export const returnBook = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = returnSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  const { bookId } = value;
  const userId = req.userId;
  const db = getDB();

  try {
    const activeTransaction = await db.get('SELECT 1 FROM sqlite_master WHERE type="table" AND name="sqlite_master";');

    if (activeTransaction) {
      res.status(500).json({ error: 'Internal Server Error' });
    }

    await db.run('BEGIN TRANSACTION'); // Start the transaction

    const borrow = await db.get(`SELECT * FROM borrowers WHERE userId = ? AND bookId = ? AND returnDate IS NULL`, [
      userId,
      bookId,
    ]);

    if (!borrow) {
      res.status(400).json({ error: 'Borrow record not found' });
      await db.run('ROLLBACK');
      return;
    }

    const returnDate = new Date().toISOString();
    await db.run(`UPDATE borrowers SET returnDate = ? WHERE id = ?`, [returnDate, borrow.id]);
    await db.run(`UPDATE books SET quantity = quantity + 1, status = 'available' WHERE id = ?`, [bookId]);
    const result = await db.get(`SELECT * from books where id = ?`, [bookId]);
    await db.run('COMMIT'); // Commit the transaction
    res.status(200).json({ message: 'Book returned successfully', data: result });
  } catch (err) {
    await db.run('ROLLBACK'); // Rollback the transaction
    res.status(500).json({ error: err.message });
  }
};
