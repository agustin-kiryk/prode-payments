// Utilidades generales

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

/**
 * Formatear fecha para mostrar en la UI
 */
export const formatMatchDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "d 'de' MMMM, HH:mm", { locale: es });
  } catch (error) {
    return dateString;
  }
};

/**
 * Formatear fecha corta
 */
export const formatShortDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'd/MM', { locale: es });
  } catch (error) {
    return dateString;
  }
};

/**
 * Verificar si un partido ya empezó
 */
export const hasMatchStarted = (dateString: string): boolean => {
  try {
    const matchDate = parseISO(dateString);
    return matchDate <= new Date();
  } catch (error) {
    return false;
  }
};

/**
 * Obtener tiempo restante hasta el partido
 */
export const getTimeUntilMatch = (dateString: string): string => {
  try {
    const matchDate = parseISO(dateString);
    const now = new Date();
    const diff = matchDate.getTime() - now.getTime();

    if (diff <= 0) return 'Comenzó';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `En ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `En ${hours}h ${minutes}m`;
    return `En ${minutes} minutos`;
  } catch (error) {
    return '';
  }
};

/**
 * Generar color de fondo para el ranking
 */
export const getRankColor = (rank: number): string => {
  if (rank === 1) return 'bg-gradient-to-r from-amarillo-oro to-yellow-500';
  if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400';
  if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-500';
  return 'bg-celeste-light';
};

/**
 * Obtener emoji de medalla por ranking
 */
export const getRankEmoji = (rank: number): string => {
  if (rank === 1) return '🏆';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '⚽';
};

/**
 * Mapeo de fases a nombres en español
 */
export const stageNames: Record<string, string> = {
  'Group Stage': 'Fase de Grupos',
  'Round of 16': 'Octavos de Final',
  'Quarter-finals': 'Cuartos de Final',
  'Semi-finals': 'Semifinales',
  'Final': 'Final',
  'Third Place': 'Tercer Puesto',
};

