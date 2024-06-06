import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../models/db';
import config from '../config/config';
import { registerSchema, loginSchema } from '../validation/authValidation';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { username, password, role } = value;
    const db = getDB();

    const user = await db.get(`SELECT id from users where username = ?`, [username]);
    if (user) {
      res.status(400).json({ error: 'Username already exists.' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, role]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { username, password } = value;
    const db = getDB();

    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, config.secret, { expiresIn: '1h' });
    res.status(200).json({ token, msg: 'Logged in successfully' });
  } catch (err) {
    console.log(' login ~ err:', err);
    res.status(500).json({ error: err.message });
  }
};
