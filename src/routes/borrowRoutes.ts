import express from 'express';
import { borrowBook, returnBook, getOverdueBooks } from '../controllers/borrowController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/borrow', authMiddleware, borrowBook);
router.post('/return', authMiddleware, returnBook);
router.get('/overdue-books', authMiddleware, roleMiddleware(['admin']), getOverdueBooks);

export default router;
