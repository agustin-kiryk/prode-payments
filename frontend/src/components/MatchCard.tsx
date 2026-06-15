// Componente de Card de Partido con formulario de pronóstico
import { useState, useEffect } from 'react';
import type { Match, User } from '../types';
import { formatMatchDate, hasMatchStarted, getTimeUntilMatch } from '../utils/helpers';
import { createPrediction, getUserPredictions } from '../utils/api';
import toast from 'react-hot-toast';

interface MatchCardProps {
  match: Match;
  selectedUser: User | null;
  onPredictionSaved: () => void;
}

export const MatchCard = ({ match, selectedUser, onPredictionSaved }: MatchCardProps) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasPrediction, setHasPrediction] = useState(false);

  const matchStarted = hasMatchStarted(match.date);
  const canPredict = match.isPronosticable && !matchStarted && selectedUser;

  // Cargar pronóstico existente si hay
  useEffect(() => {
    if (selectedUser) {
      loadExistingPrediction();
    }
  }, [selectedUser, match.id]);

  const loadExistingPrediction = async () => {
    if (!selectedUser) return;

    try {
      const predictions = await getUserPredictions(selectedUser.id);
      const existing = predictions.find(p => p.matchId === match.id);

      if (existing) {
        setHomeScore(existing.predictedHomeScore);
        setAwayScore(existing.predictedAwayScore);
        setHasPrediction(true);
      }
    } catch (error) {
      console.error('Error al cargar pronóstico:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('⚠️ Seleccioná un usuario primero');
      return;
    }

    if (!canPredict) {
      toast.error('⚠️ No se puede pronosticar este partido');
      return;
    }

    setLoading(true);
    try {
      await createPrediction({
        userId: selectedUser.id,
        matchId: match.id,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
      });

      toast.success(
        `⚽ ¡Pronóstico guardado! ${match.homeFlag} ${homeScore}-${awayScore} ${match.awayFlag}`,
        { icon: selectedUser.avatar }
      );
      setHasPrediction(true);
      onPredictionSaved();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar pronóstico');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (match.status === 'finished') {
      return (
        <span className="badge-argentina bg-green-500">
          ✓ Finalizado
        </span>
      );
    }
    if (match.status === 'live') {
      return (
        <span className="badge-argentina bg-red-500 animate-pulse">
          🔴 EN VIVO
        </span>
      );
    }
    if (matchStarted) {
      return (
        <span className="badge-argentina bg-gray-500">
          ⏱️ Comenzó
        </span>
      );
    }
    return (
      <span className="badge-argentina">
        📅 {getTimeUntilMatch(match.date)}
      </span>
    );
  };

  return (
    <div className="card-argentina p-6">
      {/* Header del card */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 font-semibold">{match.stage}</p>
          {match.group && (
            <p className="text-xs text-gray-400">{match.group}</p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-between mb-4">
        {/* Equipo local */}
        <div className="flex-1 text-center">
          <div className="text-5xl mb-2">{match.homeFlag}</div>
          <h3 className="font-bold text-lg">{match.homeTeam}</h3>
        </div>

        {/* Resultado o VS */}
        <div className="px-6">
          {match.status === 'finished' ? (
            <div className="text-center">
              <div className="text-4xl font-black text-celeste-afa">
                {match.homeScore} - {match.awayScore}
              </div>
              <p className="text-xs text-gray-500 mt-1">Final</p>
            </div>
          ) : (
            <div className="text-3xl font-black text-gray-300">VS</div>
          )}
        </div>

        {/* Equipo visitante */}
        <div className="flex-1 text-center">
          <div className="text-5xl mb-2">{match.awayFlag}</div>
          <h3 className="font-bold text-lg">{match.awayTeam}</h3>
        </div>
      </div>

      {/* Info del partido */}
      <div className="text-center text-sm text-gray-600 mb-4 border-t pt-3">
        <p className="font-semibold">📅 {formatMatchDate(match.date)}</p>
        {match.stadium && (
          <p className="text-xs text-gray-500 mt-1">🏟️ {match.stadium}</p>
        )}
      </div>

      {/* Formulario de pronóstico */}
      {canPredict ? (
        <form onSubmit={handleSubmit} className="border-t pt-4">
          <p className="text-sm font-semibold text-center mb-3 text-celeste-afa">
            {hasPrediction ? '🔄 Actualizar pronóstico' : '⚽ Hacer pronóstico'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{match.homeFlag}</span>
              <input
                type="number"
                min="0"
                max="20"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                className="input-argentina w-16 text-center text-xl font-bold"
                required
              />
            </div>

            <span className="text-2xl font-bold text-gray-400">-</span>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                className="input-argentina w-16 text-center text-xl font-bold"
                required
              />
              <span className="text-2xl">{match.awayFlag}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? '⏳ Guardando...' : hasPrediction ? '🔄 Actualizar' : '💾 Guardar pronóstico'}
          </button>
        </form>
      ) : (
        <div className="border-t pt-4 text-center text-sm text-gray-500">
          {!selectedUser && '👆 Seleccioná un usuario para pronosticar'}
          {selectedUser && !match.isPronosticable && '🔒 Pronósticos deshabilitados'}
          {selectedUser && match.isPronosticable && matchStarted && '⏱️ El partido ya comenzó'}
        </div>
      )}
    </div>
  );
};

