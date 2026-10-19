import { Router } from 'express';
import {
  createRequest,
  getRequests,
  getRequestById
} from '../controllers/request.controller.js';

const router = Router();

// Routes for emergency & scheduled blood requisitions
router.post('/', createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);

export default router;
