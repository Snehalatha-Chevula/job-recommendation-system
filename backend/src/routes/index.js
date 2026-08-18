import { Router } from 'express';
import { getHealth, getStats } from '../controllers/systemController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import companyRoutes from './companyRoutes.js';
import developerRoutes from './developerRoutes.js';
import jobRoutes from './jobRoutes.js';

const router = Router();

router.get('/health', asyncHandler(getHealth));
router.get('/stats', asyncHandler(getStats));
router.use('/developers', developerRoutes);
router.use('/jobs', jobRoutes);
router.use('/companies', companyRoutes);

export default router;
