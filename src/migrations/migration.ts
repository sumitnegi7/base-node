import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export const getDB = async () => {
  return open({
    filename: path.resolve(__dirname, '../../database.sqlite'),
    driver: sqlite3.Database,
  });
};

export const migrate = async () => {
  const db = await getDB();
  const result = await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      );
  
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        ISBN TEXT NOT NULL,
        publishedYear INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT NOT NULL
      );
  
      CREATE TABLE IF NOT EXISTS borrowers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        bookId INTEGER NOT NULL,
        borrowDate DATE NOT NULL,
        dueDate DATE NOT NULL,
        returnDate DATE,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (bookId) REFERENCES books(id)
      );
    `);
  console.log(result);
};

migrate().catch((err) => {
  console.error('Could not migrate database', err);
});
