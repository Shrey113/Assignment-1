import { Router } from 'express';
import { registerDonor } from '../controllers/donor.controller.js';

const router = Router();

// Single route: Add donor to database
router.post('/', registerDonor);

export default router;
