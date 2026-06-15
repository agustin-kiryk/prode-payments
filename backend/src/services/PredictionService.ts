// Servicio de gestión de pronósticos
// Similar a un @Service en Spring Boot

import { PrismaClient, Prediction, User, Match } from '@prisma/client';
import { ScoringService } from './ScoringService';

interface CreatePredictionDto {
  userId: number;
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
}

type PredictionWithRelations = Prediction & {
  user: User;
  match: Match;
};

export class PredictionService {
  private prisma: PrismaClient;
  private scoringService: ScoringService;

  constructor() {
    this.prisma = new PrismaClient();
    this.scoringService = new ScoringService();
  }

  /**
   * Crear o actualizar un pronóstico
   */
  async createOrUpdatePrediction(data: CreatePredictionDto): Promise<PredictionWithRelations> {
    // Validar que el partido existe y se puede pronosticar
    const canPredict = await this.scoringService.canMakePrediction(data.matchId);
    if (!canPredict) {
      throw new Error('No se puede pronosticar este partido (ya empezó o no está habilitado)');
    }

    // Validar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new Error(`Usuario con ID ${data.userId} no encontrado`);
    }

    // Validar que los scores no sean negativos
    if (data.predictedHomeScore < 0 || data.predictedAwayScore < 0) {
      throw new Error('Los resultados no pueden ser negativos');
    }

    // Buscar si ya existe un pronóstico
    const existingPrediction = await this.prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId: data.userId,
          matchId: data.matchId,
        },
      },
    });

    if (existingPrediction) {
      // Actualizar pronóstico existente
      return await this.prisma.prediction.update({
        where: { id: existingPrediction.id },
        data: {
          predictedHomeScore: data.predictedHomeScore,
          predictedAwayScore: data.predictedAwayScore,
        },
        include: {
          user: true,
          match: true,
        },
      });
    }

    // Crear nuevo pronóstico
    return await this.prisma.prediction.create({
      data: {
        userId: data.userId,
        matchId: data.matchId,
        predictedHomeScore: data.predictedHomeScore,
        predictedAwayScore: data.predictedAwayScore,
      },
      include: {
        user: true,
        match: true,
      },
    });
  }

  /**
   * Obtener pronósticos de un usuario
   */
  async getUserPredictions(userId: number) {
    return await this.prisma.prediction.findMany({
      where: { userId },
      include: {
        match: true,
      },
      orderBy: {
        match: {
          date: 'asc',
        },
      },
    });
  }

  /**
   * Obtener todos los pronósticos de un partido
   * (para ver qué pronosticaron los demás)
   */
  async getMatchPredictions(matchId: number) {
    return await this.prisma.prediction.findMany({
      where: { matchId },
      include: {
        user: true,
        match: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Verificar si un usuario ya pronosticó un partido
   */
  async hasPrediction(userId: number, matchId: number): Promise<boolean> {
    const prediction = await this.prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId,
        },
      },
    });

    return !!prediction;
  }

  /**
   * Obtener estadísticas de pronósticos por partido
   */
  async getMatchPredictionStats(matchId: number) {
    const predictions = await this.prisma.prediction.findMany({
      where: { matchId },
    });

    const totalPredictions = predictions.length;

    // Calcular promedio de goles pronosticados
    const avgHomeScore = predictions.reduce((sum, p) => sum + p.predictedHomeScore, 0) / totalPredictions;
    const avgAwayScore = predictions.reduce((sum, p) => sum + p.predictedAwayScore, 0) / totalPredictions;

    // Contar tendencias
    const homeWins = predictions.filter(p => p.predictedHomeScore > p.predictedAwayScore).length;
    const awayWins = predictions.filter(p => p.predictedHomeScore < p.predictedAwayScore).length;
    const draws = predictions.filter(p => p.predictedHomeScore === p.predictedAwayScore).length;

    return {
      totalPredictions,
      avgHomeScore: avgHomeScore.toFixed(1),
      avgAwayScore: avgAwayScore.toFixed(1),
      homeWins,
      awayWins,
      draws,
    };
  }
}

