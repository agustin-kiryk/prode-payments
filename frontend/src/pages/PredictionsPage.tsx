// Página de pronósticos por usuario - Vista minimalista en tabla
import { useState, useEffect } from 'react';
import { getUserPredictions } from '../utils/api';
import type { User, Prediction } from '../types';
import { toast } from 'react-hot-toast';

interface PredictionsPageProps {
  users: User[];
  selectedUser: User | null;
}

export const PredictionsPage = ({ users, selectedUser: defaultUser }: PredictionsPageProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(defaultUser);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultUser) {
      setSelectedUser(defaultUser);
    }
  }, [defaultUser]);

  useEffect(() => {
    if (selectedUser) {
      loadPredictions(selectedUser.id);
    }
  }, [selectedUser]);

  const loadPredictions = async (userId: number) => {
    setLoading(true);
    try {
      const data = await getUserPredictions(userId);
      // Filtrar solo los que tienen match y ordenar por fecha del partido
      const filtered = data.filter(p => p.match);
      const sorted = filtered.sort((a, b) =>
        new Date(a.match!.date).getTime() - new Date(b.match!.date).getTime()
      );
      setPredictions(sorted);
    } catch (error) {
      console.error('Error al cargar pronósticos:', error);
      toast.error('Error al cargar pronósticos');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const getResultBadge = (pred: Prediction) => {
    if (!pred.points) return null;

    if (pred.points === 5) {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">⚽ Exacto (5pts)</span>;
    } else if (pred.points === 3) {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">✅ Resultado (3pts)</span>;
    } else if (pred.points === 1) {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">📊 Diferencia (1pt)</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">❌ 0pts</span>;
    }
  };

  const getTotalPoints = () => {
    return predictions.reduce((sum, pred) => sum + (pred.points || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚽</div>
          <p className="text-xl text-celeste-afa font-bold">Cargando pronósticos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de usuario */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-black text-celeste-afa flex items-center gap-2">
            📋 Pronósticos por Usuario
          </h2>

          <div className="flex items-center gap-4">
            <label htmlFor="user-select" className="text-sm font-bold text-gray-700">Seleccionar usuario:</label>
            <select
              id="user-select"
              value={selectedUser?.id || ''}
              onChange={(e) => handleUserChange(Number(e.target.value))}
              className="px-4 py-2 border-2 border-celeste-afa rounded-lg font-bold text-celeste-afa focus:outline-none focus:ring-2 focus:ring-celeste-afa"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.avatar} {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedUser && predictions.length > 0 && (
          <div className="mt-4 flex items-center gap-6 p-4 bg-celeste-light/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{ backgroundColor: selectedUser.color }}
              >
                {selectedUser.avatar}
              </div>
              <div>
                <div className="font-bold text-lg">{selectedUser.name}</div>
                <div className="text-sm text-gray-600">{predictions.length} pronósticos</div>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-3xl font-black text-celeste-afa">{getTotalPoints()}</div>
              <div className="text-xs text-gray-600 font-semibold">PUNTOS TOTALES</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de pronósticos */}
      {predictions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🤔</div>
          <p className="text-xl font-bold text-gray-600">
            {selectedUser?.name} aún no tiene pronósticos
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-celeste-afa text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Fase</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Partido</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Pronóstico</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Resultado</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.map((pred) => {
                  const match = pred.match!;
                  const isFinished = match.status === 'finished';

                  return (
                    <tr
                      key={pred.id}
                      className="hover:bg-celeste-light/10 transition-colors"
                    >
                      {/* Fecha */}
                      <td className="px-4 py-3 text-sm">
                        <div className="font-semibold text-gray-900">
                          {new Date(match.date).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(match.date).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Fase */}
                      <td className="px-4 py-3 text-xs font-semibold text-gray-600">
                        {match.stage}
                      </td>

                      {/* Partido */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{match.homeFlag}</span>
                            <span className="font-bold text-sm text-gray-900">{match.homeTeam}</span>
                          </div>
                          <span className="text-gray-400 font-bold">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{match.awayTeam}</span>
                            <span className="text-2xl">{match.awayFlag}</span>
                          </div>
                        </div>
                      </td>

                      {/* Pronóstico */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="px-3 py-1 bg-celeste-afa text-white font-bold rounded">
                            {pred.predictedHomeScore}
                          </span>
                          <span className="text-gray-400">-</span>
                          <span className="px-3 py-1 bg-celeste-afa text-white font-bold rounded">
                            {pred.predictedAwayScore}
                          </span>
                        </div>
                      </td>

                      {/* Resultado real */}
                      <td className="px-4 py-3">
                        {isFinished && match.homeScore !== undefined && match.awayScore !== undefined ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-700 text-white font-bold rounded">
                              {match.homeScore}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className="px-3 py-1 bg-gray-700 text-white font-bold rounded">
                              {match.awayScore}
                            </span>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-gray-400 italic">
                            Por jugarse
                          </div>
                        )}
                      </td>

                      {/* Puntos */}
                      <td className="px-4 py-3 text-center">
                        {isFinished ? getResultBadge(pred) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumen al final */}
          <div className="bg-gray-50 px-6 py-4 border-t-2 border-celeste-afa">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-bold">{predictions.length}</span> pronósticos totales
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-semibold">TOTAL:</span>
                <span className="text-2xl font-black text-celeste-afa">{getTotalPoints()}</span>
                <span className="text-sm text-gray-600">puntos</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

