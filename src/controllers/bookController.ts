import { Request, Response } from 'express';
import { getDB } from '../database/db';
import { bookSchema } from '../validation/bookValidation';

export const addBook = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = bookSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  const { title, author, ISBN, publishedYear, quantity, status } = value;
  const db = getDB();
  const book = await db.get(`SELECT id from books where ISBN = ?`, [ISBN]);

  if (book) {
    res.status(400).json({ error: 'Book with same ISBN already exists.' });
    return;
  }

  try {
    await db.run(`INSERT INTO books (title, author, ISBN, publishedYear, quantity, status) VALUES (?, ?, ?, ?, ?, ?)`, [
      title,
      author,
      ISBN,
      publishedYear,
      quantity,
      status,
    ]);

    const result = await db.get(`SELECT * from books where ISBN = ?`, [ISBN]);
    res.status(201).json({ message: 'Book added successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = bookSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  const { id } = req.params;
  const { title, author, ISBN, publishedYear, quantity, status } = value;
  const db = getDB();

  const book = await db.get(`SELECT id from books where ISBN = ? and id <> ?`, [ISBN, id]);

  if (book) {
    res.status(400).json({ error: 'Book with same ISBN already exists.' });
    return;
  }

  try {
    await db.run(
      `UPDATE books SET title = ?, author = ?, ISBN = ?, publishedYear = ?, quantity = ?, status = ? WHERE id = ?`,
      [title, author, ISBN, publishedYear, quantity, status, id],
    );
    const data = await db.get(`SELECT * from books where ISBN = ?`, [ISBN]);
    res.status(201).json({ message: 'Book updated successfully', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = getDB();

  try {
    const result = await db.run(`DELETE FROM books WHERE id = ?`, [id]);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  const db = getDB();

  try {
    const result = await db.all(`SELECT * FROM books`);
    res.status(200).json({ message: 'Book details fetched successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
