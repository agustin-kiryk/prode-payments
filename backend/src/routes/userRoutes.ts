// Rutas de usuarios y leaderboard
// Similar a @RequestMapping en Spring Boot

import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getLeaderboard,
  getProdeStats,
} from '../controllers/userController';

const router = Router();

// Rutas específicas PRIMERO (antes de /:id)
router.get('/leaderboard/all', getLeaderboard);
router.get('/stats/prode', getProdeStats);

// Rutas genéricas DESPUÉS
router.get('/', getAllUsers);
router.get('/:id', getUserById);

export default router;

