import { Router } from 'express';
import { createRequest } from '../controllers/request.controller.js';

const router = Router();

// Single route: Add blood request to database
router.post('/', createRequest);

export default router;
