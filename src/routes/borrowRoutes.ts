import express from 'express';
import { borrowBook, returnBook } from '../controllers/borrowController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/borrow', authMiddleware, borrowBook);
router.post('/return', authMiddleware, returnBook);

export default router;
