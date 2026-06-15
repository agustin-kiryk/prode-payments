// Controller de partidos
// Similar a @RestController en Spring Boot

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { FootballApiService } from '../services/FootballApiService';
import { ScoringService } from '../services/ScoringService';
import { emitLeaderboardUpdate, emitMatchResultUpdate } from '../config/socket';

const prisma = new PrismaClient();
const footballApi = new FootballApiService();
const scoringService = new ScoringService();

/**
 * GET /api/matches
 * Obtener todos los partidos
 */
export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const { stage, status } = req.query;

    const matches = await prisma.match.findMany({
      where: {
        ...(stage && { stage: stage as string }),
        ...(status && { status: status as string }),
      },
      orderBy: {
        date: 'asc',
      },
    });

    res.json({
      success: true,
      data: matches,
      count: matches.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener partidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener partidos',
    });
  }
};

/**
 * GET /api/matches/:id
 * Obtener un partido específico
 */
export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: parseInt(id) },
      include: {
        predictions: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado',
      });
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error('❌ Error al obtener partido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener partido',
    });
  }
};

/**
 * POST /api/admin/sync-matches
 * ⚠️ ADMIN: Sincronizar partidos desde API-Football
 */
export const syncMatches = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Iniciando sincronización de partidos...');

    const fixtures = await footballApi.getWorldCupFixtures();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const fixture of fixtures) {
      // Validaciones: saltar partidos incompletos
      if (!fixture.apiFootballId) {
        skipped++;
        continue;
      }

      // Saltar partidos donde los equipos aún no están definidos (ej: fases eliminatorias TBD)
      if (!fixture.homeTeam || !fixture.awayTeam ||
          fixture.homeTeam === 'null' || fixture.awayTeam === 'null') {
        console.log(`⏭️ Saltando partido ${fixture.apiFootballId}: equipos no definidos aún`);
        skipped++;
        continue;
      }

      const existing = await prisma.match.findUnique({
        where: { apiFootballId: fixture.apiFootballId },
      });

      if (existing) {
        await prisma.match.update({
          where: { apiFootballId: fixture.apiFootballId },
          data: fixture,
        });
        console.log(`📝 Actualizado: ${fixture.homeTeam} vs ${fixture.awayTeam} (pronosticable: ${fixture.isPronosticable})`);
        updated++;
      } else {
        await prisma.match.create({
          data: fixture as any,
        });
        created++;
      }
    }

    console.log(`✅ Sincronización completa: ${created} creados, ${updated} actualizados, ${skipped} saltados`);

    res.json({
      success: true,
      message: `✅ Sincronización completa: ${created} creados, ${updated} actualizados, ${skipped} saltados (equipos TBD)`,
      created,
      updated,
      skipped,
    });
  } catch (error) {
    console.error('❌ Error al sincronizar partidos:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al sincronizar partidos',
    });
  }
};

/**
 * PUT /api/admin/matches/:id/result
 * ⚠️ ADMIN: Actualizar resultado de un partido
 */
export const updateMatchResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { homeScore, awayScore, status } = req.body;

    // Validaciones
    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({
        success: false,
        error: 'homeScore y awayScore son requeridos',
      });
    }

    if (homeScore < 0 || awayScore < 0) {
      return res.status(400).json({
        success: false,
        error: 'Los resultados no pueden ser negativos',
      });
    }

    // Actualizar partido
    const match = await prisma.match.update({
      where: { id: parseInt(id) },
      data: {
        homeScore,
        awayScore,
        status: status || 'finished',
        isPronosticable: false, // Ya no se puede pronosticar
      },
    });

    // Recalcular puntos de todos los pronósticos de este partido
    await scoringService.updatePredictionsForMatch(parseInt(id));

    // Emitir eventos de actualización a todos los clientes
    emitMatchResultUpdate(parseInt(id));
    emitLeaderboardUpdate();

    res.json({
      success: true,
      message: `✅ Resultado actualizado y puntos recalculados`,
      data: match,
    });
  } catch (error) {
    console.error('❌ Error al actualizar resultado:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar resultado',
    });
  }
};

/**
 * PATCH /api/admin/matches/:id/toggle-pronosticable
 * ⚠️ ADMIN: Habilitar/deshabilitar pronósticos para un partido
 */
export const togglePronosticable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: parseInt(id) },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado',
      });
    }

    const updated = await prisma.match.update({
      where: { id: parseInt(id) },
      data: {
        isPronosticable: !match.isPronosticable,
      },
    });

    res.json({
      success: true,
      message: `✅ Pronósticos ${updated.isPronosticable ? 'habilitados' : 'deshabilitados'}`,
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar estado',
    });
  }
};

/**
 * GET /api/matches/stages
 * Obtener lista de fases disponibles
 */
export const getStages = async (req: Request, res: Response) => {
  try {
    const stages = await prisma.match.findMany({
      select: {
        stage: true,
      },
      distinct: ['stage'],
      orderBy: {
        date: 'asc',
      },
    });

    res.json({
      success: true,
      data: stages.map(s => s.stage),
    });
  } catch (error) {
    console.error('❌ Error al obtener fases:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener fases',
    });
  }
};

/**
 * POST /api/admin/matches/fix-pronosticable
 * ⚠️ ADMIN: Activar pronosticable en partidos con equipos definidos
 */
export const fixPronosticable = async (req: Request, res: Response) => {
  try {
    console.log('🔧 Corrigiendo campo isPronosticable...');

    // Obtener todos los partidos scheduled (Prisma no tiene una forma simple de filtrar NOT NULL en strings)
    const allMatches = await prisma.match.findMany({
      where: {
        status: 'scheduled',
      },
    });

    // Filtrar los que tienen equipos definidos
    const matches = allMatches.filter(m => m.homeTeam && m.awayTeam);

    console.log(`📊 Encontrados ${matches.length} partidos programados con equipos definidos`);

    let fixed = 0;
    for (const match of matches) {
      if (!match.isPronosticable) {
        await prisma.match.update({
          where: { id: match.id },
          data: { isPronosticable: true },
        });
        console.log(`✅ Habilitado: ${match.homeTeam} vs ${match.awayTeam}`);
        fixed++;
      }
    }

    console.log(`✅ Corrección completa: ${fixed} partidos habilitados para pronosticar`);

    res.json({
      success: true,
      message: `✅ ${fixed} partidos habilitados para pronosticar`,
      total: matches.length,
      fixed,
    });
  } catch (error) {
    console.error('❌ Error al corregir pronosticable:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al corregir',
    });
  }
};


