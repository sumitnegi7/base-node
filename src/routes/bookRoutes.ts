import express from 'express';
import { addBook, updateBook, deleteBook, getAllBooks } from '../controllers/bookController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), addBook);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateBook);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteBook);
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllBooks);

export default router;
