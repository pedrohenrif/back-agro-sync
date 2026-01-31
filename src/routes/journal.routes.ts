import { Router } from 'express';
import {createJournalEntry, getJournalByGarden} from '../controllers/journal.controller.js';

const router = Router();

router.post('/', createJournalEntry);
router.get('/garden/:gardenId', getJournalByGarden);

export default router;