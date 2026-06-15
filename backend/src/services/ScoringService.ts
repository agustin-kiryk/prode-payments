// Servicio de cálculo de puntajes
// Similar a un @Service en Spring Boot con lógica de negocio

import { PrismaClient, Prediction, Match } from '@prisma/client';

export class ScoringService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Calcular puntos de un pronóstico
   * Reglas:
   * - Resultado exacto (goles y ganador): 3 puntos
   * - Acertar ganador o empate pero no resultado exacto: 1 punto
   * - No acertar: 0 puntos
   */
  calculatePoints(
    predictedHome: number,
    predictedAway: number,
    actualHome: number,
    actualAway: number
  ): number {
    // Resultado exacto
    if (predictedHome === actualHome && predictedAway === actualAway) {
      return 3;
    }

    // Verificar si acertó el resultado (ganador/empate)
    const predictedResult = this.getMatchResult(predictedHome, predictedAway);
    const actualResult = this.getMatchResult(actualHome, actualAway);

    if (predictedResult === actualResult) {
      return 1;
    }

    return 0;
  }

  /**
   * Obtener resultado del partido (home, away, draw)
   */
  private getMatchResult(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
    if (homeScore > awayScore) return 'home';
    if (awayScore > homeScore) return 'away';
    return 'draw';
  }

  /**
   * Actualizar puntos de todas las predicciones de un partido
   * Se ejecuta cuando el partido termina y tiene resultado real
   */
  async updatePredictionsForMatch(matchId: number): Promise<number> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { predictions: true },
    });

    if (!match) {
      throw new Error(`Partido con ID ${matchId} no encontrado`);
    }

    if (match.homeScore === null || match.awayScore === null) {
      throw new Error(`Partido ${matchId} no tiene resultado todavía`);
    }

    let updatedCount = 0;

    for (const prediction of match.predictions) {
      const points = this.calculatePoints(
        prediction.predictedHomeScore,
        prediction.predictedAwayScore,
        match.homeScore,
        match.awayScore
      );

      await this.prisma.prediction.update({
        where: { id: prediction.id },
        data: { points },
      });

      updatedCount++;
    }

    console.log(`✅ Actualizados ${updatedCount} pronósticos para partido ${matchId}`);
    return updatedCount;
  }

  /**
   * Obtener tabla de posiciones (leaderboard)
   * Similar a una Query con agregación en JPA
   */
  async getLeaderboard() {
    // Obtener todos los usuarios con sus predicciones
    const users = await this.prisma.user.findMany({
      include: {
        predictions: {
          include: {
            match: true,
          },
        },
      },
    });

    // Calcular estadísticas por usuario
    const leaderboard = users.map(user => {
      const totalPoints = user.predictions.reduce((sum, pred) => sum + pred.points, 0);
      const totalPredictions = user.predictions.length;
      const exactResults = user.predictions.filter(p => p.points === 3).length;
      const partialResults = user.predictions.filter(p => p.points === 1).length;
      const wrongResults = user.predictions.filter(p => p.points === 0).length;

      return {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
        totalPoints,
        totalPredictions,
        exactResults,
        partialResults,
        wrongResults,
      };
    });

    // Ordenar por puntos (descendente) y luego por nombre
    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.name.localeCompare(b.name);
    });

    // Agregar posición (rank)
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  /**
   * Verificar si un usuario puede hacer un pronóstico
   * No se puede pronosticar si el partido ya empezó
   */
  async canMakePrediction(matchId: number): Promise<boolean> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error(`Partido con ID ${matchId} no encontrado`);
    }

    // No se puede pronosticar si el partido no es pronosticable
    if (!match.isPronosticable) {
      return false;
    }

    // No se puede pronosticar si el partido ya empezó
    const now = new Date();
    if (match.date <= now) {
      return false;
    }

    return true;
  }

  /**
   * Obtener estadísticas generales del prode
   */
  async getProdeStats() {
    const totalMatches = await this.prisma.match.count();
    const finishedMatches = await this.prisma.match.count({
      where: { status: 'finished' },
    });
    const totalPredictions = await this.prisma.prediction.count();
    const totalUsers = await this.prisma.user.count();

    return {
      totalMatches,
      finishedMatches,
      pendingMatches: totalMatches - finishedMatches,
      totalPredictions,
      totalUsers,
      averagePredictionsPerMatch: totalMatches > 0 ? (totalPredictions / totalMatches).toFixed(1) : 0,
    };
  }
}

