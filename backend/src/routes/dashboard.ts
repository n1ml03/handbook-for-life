import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const dashboardController = new DashboardController();

router.get('/overview', dashboardController.getOverview.bind(dashboardController));

router.get('/character-stats', dashboardController.getCharacterStats.bind(dashboardController));

export default router;
