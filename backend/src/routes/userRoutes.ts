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
// Soportar both paths depending on how router is mounted.
// - If mounted at /api/users => /api/users/leaderboard/all
// - If mounted at /api/leaderboard => /api/leaderboard/all
router.get('/leaderboard/all', getLeaderboard);
router.get('/all', getLeaderboard);
router.get('/stats/prode', getProdeStats);

// Rutas genéricas DESPUÉS
router.get('/', getAllUsers);
router.get('/:id', getUserById);

export default router;

