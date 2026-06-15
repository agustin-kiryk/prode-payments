// Rutas de pronósticos
// Similar a @RequestMapping en Spring Boot

import { Router } from 'express';
import {
  createPrediction,
  getUserPredictions,
  getMatchPredictions,
  getMatchPredictionStats,
  checkPrediction,
} from '../controllers/predictionController';

const router = Router();

router.post('/', createPrediction);
router.get('/user/:userId', getUserPredictions);
router.get('/match/:matchId', getMatchPredictions);
router.get('/match/:matchId/stats', getMatchPredictionStats);
router.get('/check/:userId/:matchId', checkPrediction);

export default router;

