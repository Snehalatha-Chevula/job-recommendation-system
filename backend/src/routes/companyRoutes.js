import { Router } from 'express';
import { getCompany } from '../controllers/jobController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRouteId } from '../middleware/validateId.js';

const router = Router();

router.get('/:id', validateRouteId('id'), asyncHandler(getCompany));

export default router;
