import { Router } from 'express';
import {
  getDeveloper,
  getDevelopers,
  getRecommendations,
} from '../controllers/developerController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRouteId } from '../middleware/validateId.js';

const router = Router();

router.get('/', asyncHandler(getDevelopers));
router.get('/:id', validateRouteId('id'), asyncHandler(getDeveloper));
router.get('/:id/recommendations', validateRouteId('id'), asyncHandler(getRecommendations));

export default router;
