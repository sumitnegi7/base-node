import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export const connectDB = async (): Promise<void> => {
  let dbFile;
  if (process.env.NODE_ENV === 'test') {
    dbFile = path.resolve(__dirname, '../../test.sqlite');
  } else {
    dbFile = path.resolve(__dirname, '../../database.sqlite');
  }
  db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });
};

export const getDB = (): Database<sqlite3.Database, sqlite3.Statement> => {
  if (!db) {
    throw new Error('Database not connected.');
  }
  return db;
};
