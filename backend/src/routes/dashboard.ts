import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview data
 *     description: Returns combined data from swimsuits, accessories, skills, and bromides in a single request. This endpoint optimizes the ItemsPage.tsx which previously made 4 separate API calls.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard overview data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     swimsuits:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Swimsuit'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMetadata'
 *                     accessories:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Item'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMetadata'
 *                     skills:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Skill'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMetadata'
 *                     bromides:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Bromide'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMetadata'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalSwimsuits:
 *                           type: number
 *                         totalAccessories:
 *                           type: number
 *                         totalSkills:
 *                           type: number
 *                         totalBromides:
 *                           type: number
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/overview', dashboardController.getOverview.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/character-stats:
 *   get:
 *     summary: Get character statistics
 *     description: Returns statistical data about characters and swimsuits for dashboard analytics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Character statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCharacters:
 *                       type: number
 *                     totalSwimsuits:
 *                       type: number
 *                     averageSwimsuitsPerCharacter:
 *                       type: string
 *                     charactersByBirthday:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     swimsuitsByRarity:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     recentlyAdded:
 *                       type: object
 *                       properties:
 *                         characters:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Character'
 *                         swimsuits:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Swimsuit'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/character-stats', dashboardController.getCharacterStats.bind(dashboardController));

export default router;
