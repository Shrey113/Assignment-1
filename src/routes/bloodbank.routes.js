import { Router } from 'express';
import {
  getAllCitiesBloodBanks,
  getBloodBanksByCity,
  getBloodBankDetail
} from '../controllers/bloodbank.controller.js';

const router = Router();

// 1. Directory of all 34 Gujarat districts/cities and their blood bank counts
router.get('/', getAllCitiesBloodBanks);

// 2. All blood banks in a specific city/district
router.get('/city/:city', getBloodBanksByCity);

// 3. Specific blood bank details & stock monitor
router.get('/city/:city/:id', getBloodBankDetail);

export default router;
