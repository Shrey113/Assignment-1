import { Router } from 'express';
import {
  registerDonor,
  getDonors,
  getDonorById
} from '../controllers/donor.controller.js';

const router = Router();

// Routes for voluntary donors
router.post('/', registerDonor);
router.get('/', getDonors);
router.get('/:id', getDonorById);

export default router;
