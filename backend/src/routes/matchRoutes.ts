// Rutas de partidos
// Similar a @RequestMapping en Spring Boot

import { Router } from 'express';
import {
  getAllMatches,
  getMatchById,
  syncMatches,
  updateMatchResult,
  togglePronosticable,
  getStages,
  fixPronosticable,
} from '../controllers/matchController';
import { adminAuth } from '../config/adminAuth';

const router = Router();

// Rutas públicas
router.get('/', getAllMatches);
router.get('/stages', getStages);
router.get('/:id', getMatchById);

// Rutas de admin (requieren token)
router.post('/admin/sync', adminAuth, syncMatches);
router.post('/admin/fix-pronosticable', adminAuth, fixPronosticable);
router.put('/admin/:id/result', adminAuth, updateMatchResult);
router.patch('/admin/:id/toggle-pronosticable', adminAuth, togglePronosticable);

export default router;

