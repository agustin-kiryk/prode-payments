// Controller de usuarios y leaderboard
// Similar a @RestController en Spring Boot

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ScoringService } from '../services/ScoringService';

const prisma = new PrismaClient();
const scoringService = new ScoringService();

/**
 * GET /api/users
 * Obtener todos los usuarios
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios',
    });
  }
};

/**
 * GET /api/users/:id
 * Obtener un usuario específico
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        predictions: {
          include: {
            match: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
    });
  }
};

/**
 * GET /api/leaderboard
 * Obtener tabla de posiciones
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await scoringService.getLeaderboard();

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('❌ Error al obtener leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener leaderboard',
    });
  }
};

/**
 * GET /api/stats
 * Obtener estadísticas generales del prode
 */
export const getProdeStats = async (req: Request, res: Response) => {
  try {
    const stats = await scoringService.getProdeStats();

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

