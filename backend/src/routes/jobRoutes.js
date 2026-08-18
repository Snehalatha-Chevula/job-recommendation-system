import { Router } from 'express';
import { getJob } from '../controllers/jobController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRouteId } from '../middleware/validateId.js';

const router = Router();

router.get('/:id', validateRouteId('id'), asyncHandler(getJob));

export default router;
