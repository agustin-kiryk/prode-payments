// Componente de Tabla de Posiciones
import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../utils/api';
import { getRankEmoji } from '../utils/helpers';

interface LeaderboardProps {
  refreshTrigger?: number;
}

export const Leaderboard = ({ refreshTrigger }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [refreshTrigger]);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error al cargar leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-argentina p-8 text-center">
        <div className="animate-spin text-6xl mb-4">⚽</div>
        <p className="text-gray-600">Cargando tabla de posiciones...</p>
      </div>
    );
  }

  return (
    <div className="card-argentina overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-celeste p-6 text-center">
        <h2 className="text-3xl font-black text-white mb-2">
          🏆 TABLA DE POSICIONES 🏆
        </h2>
        <p className="text-white/90 text-sm">
          Ranking actualizado en tiempo real
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-celeste-light text-celeste-afa">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-center">Puntos</th>
              <th className="px-4 py-3 text-center">Exactos</th>
              <th className="px-4 py-3 text-center">Parciales</th>
              <th className="px-4 py-3 text-center">Pronósticos</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.userId}
                className={`border-b transition-all hover:bg-celeste-light/30 ${
                  index === 0 ? 'bg-amarillo-oro/10' : ''
                }`}
              >
                {/* Ranking */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                    <span className="font-bold text-lg">{entry.rank}</span>
                  </div>
                </td>

                {/* Jugador */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{entry.avatar}</span>
                    <div>
                      <p className="font-bold text-lg">{entry.name}</p>
                      {entry.rank <= 3 && (
                        <p className="text-xs text-gray-500">
                          {entry.rank === 1 && '🎉 ¡Líder!'}
                          {entry.rank === 2 && '💪 Segundo lugar'}
                          {entry.rank === 3 && '🔥 Tercer lugar'}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Puntos totales */}
                <td className="px-4 py-4 text-center">
                  <div className="inline-block bg-celeste-afa text-white px-4 py-2 rounded-full font-black text-xl">
                    {entry.totalPoints}
                  </div>
                </td>

                {/* Exactos */}
                <td className="px-4 py-4 text-center">
                  <div className="text-green-600 font-bold text-lg">
                    {entry.exactResults}
                  </div>
                  <p className="text-xs text-gray-500">3 pts</p>
                </td>

                {/* Parciales */}
                <td className="px-4 py-4 text-center">
                  <div className="text-yellow-600 font-bold text-lg">
                    {entry.partialResults}
                  </div>
                  <p className="text-xs text-gray-500">1 pt</p>
                </td>

                {/* Total pronósticos */}
                <td className="px-4 py-4 text-center">
                  <div className="text-gray-700 font-semibold">
                    {entry.totalPredictions}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
        <p className="font-semibold mb-2">📊 Sistema de puntuación:</p>
        <div className="flex justify-center gap-6">
          <span>✅ Resultado exacto = <strong>3 puntos</strong></span>
          <span>🎯 Ganador correcto = <strong>1 punto</strong></span>
          <span>❌ Error = <strong>0 puntos</strong></span>
        </div>
      </div>
    </div>
  );
};

