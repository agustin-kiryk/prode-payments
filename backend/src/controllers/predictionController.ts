// Controller de pronósticos
// Similar a @RestController en Spring Boot

import { Request, Response } from 'express';
import { PredictionService } from '../services/PredictionService';
import { emitNewPrediction } from '../config/socket';

const predictionService = new PredictionService();

/**
 * POST /api/predictions
 * Crear o actualizar un pronóstico
 */
export const createPrediction = async (req: Request, res: Response) => {
  try {
    const { userId, matchId, predictedHomeScore, predictedAwayScore } = req.body;

    // Validaciones
    if (!userId || !matchId || predictedHomeScore === undefined || predictedAwayScore === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId, matchId, predictedHomeScore y predictedAwayScore son requeridos',
      });
    }

    const prediction = await predictionService.createOrUpdatePrediction({
      userId,
      matchId,
      predictedHomeScore,
      predictedAwayScore,
    });

    // Emitir evento de nueva predicción a todos los clientes conectados
    emitNewPrediction({
      userName: prediction.user.name,
      userAvatar: prediction.user.avatar,
      homeTeam: prediction.match.homeTeam,
      awayTeam: prediction.match.awayTeam,
      homeFlag: prediction.match.homeFlag,
      awayFlag: prediction.match.awayFlag,
      predictedHomeScore,
      predictedAwayScore,
    });

    res.json({
      success: true,
      message: '⚽ Pronóstico guardado exitosamente',
      data: prediction,
    });
  } catch (error) {
    console.error('❌ Error al crear pronóstico:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear pronóstico',
    });
  }
};

/**
 * GET /api/predictions/user/:userId
 * Obtener pronósticos de un usuario
 */
export const getUserPredictions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const predictions = await predictionService.getUserPredictions(parseInt(userId));

    res.json({
      success: true,
      data: predictions,
      count: predictions.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener pronósticos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pronósticos',
    });
  }
};

/**
 * GET /api/predictions/match/:matchId
 * Obtener todos los pronósticos de un partido
 */
export const getMatchPredictions = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    const predictions = await predictionService.getMatchPredictions(parseInt(matchId));

    res.json({
      success: true,
      data: predictions,
      count: predictions.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener pronósticos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pronósticos',
    });
  }
};

/**
 * GET /api/predictions/match/:matchId/stats
 * Obtener estadísticas de pronósticos de un partido
 */
export const getMatchPredictionStats = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    const stats = await predictionService.getMatchPredictionStats(parseInt(matchId));

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
    });
  }
};

/**
 * GET /api/predictions/check/:userId/:matchId
 * Verificar si un usuario ya pronosticó un partido
 */
export const checkPrediction = async (req: Request, res: Response) => {
  try {
    const { userId, matchId } = req.params;

    const hasPrediction = await predictionService.hasPrediction(
      parseInt(userId),
      parseInt(matchId)
    );

    res.json({
      success: true,
      hasPrediction,
    });
  } catch (error) {
    console.error('❌ Error al verificar pronóstico:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar pronóstico',
    });
  }
};


