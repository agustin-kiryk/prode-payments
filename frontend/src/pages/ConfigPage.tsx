// Página de configuración de administración
import { useState } from 'react';
import { syncMatches, updateMatchResult, togglePronosticable, getMatches, fixPronosticable } from '../utils/api';
import type { Match } from '../types';
import toast from 'react-hot-toast';

export const ConfigPage = () => {
  const [adminToken, setAdminToken] = useState('prode-admin-2026');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSyncMatches = async () => {
    if (!confirm('⚠️ ¿Estás seguro de sincronizar partidos desde API-Football?\n\nEsto actualizará todos los partidos.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await syncMatches(adminToken);
      toast.success(`✅ ${result.created} partidos creados, ${result.updated} actualizados`);
      loadMatches();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al sincronizar');
    } finally {
      setLoading(false);
    }
  };

  const handleFixPronosticable = async () => {
    if (!confirm('⚠️ ¿Habilitar pronósticos en todos los partidos programados?\n\nEsto marcará como pronosticables todos los partidos con equipos definidos.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await fixPronosticable(adminToken);
      toast.success(`✅ ${result.fixed} partidos habilitados para pronosticar`);
      loadMatches();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al habilitar');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async () => {
    if (!selectedMatch) {
      toast.error('Seleccioná un partido');
      return;
    }

    if (!confirm(`⚠️ ¿Estás seguro de actualizar el resultado?\n\nEsto recalculará todos los puntos.`)) {
      return;
    }

    setLoading(true);
    try {
      await updateMatchResult(selectedMatch, homeScore, awayScore, adminToken);
      toast.success('✅ Resultado actualizado y puntos recalculados');
      loadMatches();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePronosticable = async (matchId: number) => {
    if (!confirm('⚠️ ¿Cambiar estado de pronósticos para este partido?')) {
      return;
    }

    setLoading(true);
    try {
      await togglePronosticable(matchId, adminToken);
      toast.success('✅ Estado actualizado');
      loadMatches();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error al cargar partidos:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <span className="text-6xl">⚠️</span>
          <div>
            <h2 className="text-2xl font-black mb-2">ZONA DE ADMINISTRACIÓN</h2>
            <p className="text-lg">
              Estas acciones modifican datos reales del prode. Usá con precaución.
            </p>
          </div>
        </div>
      </div>

      {/* Token de admin */}
      <div className="card-argentina p-6">
        <h3 className="text-xl font-bold mb-4">🔑 Token de Administrador</h3>
        <input
          type="text"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
          className="input-argentina w-full"
          placeholder="Token de admin"
        />
        <p className="text-sm text-gray-500 mt-2">
          Definido en <code className="bg-gray-100 px-2 py-1 rounded">backend/.env</code>
        </p>
      </div>

      {/* Sincronizar partidos */}
      <div className="card-argentina p-6">
        <h3 className="text-xl font-bold mb-4">🔄 Sincronizar Partidos desde API</h3>
        <p className="text-gray-600 mb-4">
          Obtiene todos los partidos del Mundial 2026 desde Football-Data.org y los guarda en la base de datos.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleSyncMatches}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar Partidos'}
          </button>
          <button
            onClick={handleFixPronosticable}
            disabled={loading}
            className="btn-oro"
          >
            {loading ? '⏳ Procesando...' : '✅ Habilitar Pronósticos'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          💡 Si los partidos no se pueden pronosticar después de sincronizar, usá "Habilitar Pronósticos"
        </p>
      </div>

      {/* Actualizar resultado */}
      <div className="card-argentina p-6">
        <h3 className="text-xl font-bold mb-4">📝 Actualizar Resultado de Partido</h3>
        <p className="text-gray-600 mb-4">
          Actualiza el resultado real de un partido y recalcula automáticamente los puntos de todos los pronósticos.
        </p>

        <button onClick={loadMatches} className="btn-primary mb-4">
          📂 Cargar Partidos
        </button>

        {matches.length > 0 && (
          <div className="space-y-4">
            <select
              value={selectedMatch || ''}
              onChange={(e) => setSelectedMatch(parseInt(e.target.value))}
              className="input-argentina w-full"
            >
              <option value="">Seleccionar partido...</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.homeFlag} {match.homeTeam} vs {match.awayTeam} {match.awayFlag}
                </option>
              ))}
            </select>

            {selectedMatch && (
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="input-argentina w-20 text-center font-bold text-xl"
                  placeholder="0"
                />
                <span className="text-2xl font-bold">-</span>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="input-argentina w-20 text-center font-bold text-xl"
                  placeholder="0"
                />
                <button
                  onClick={handleUpdateResult}
                  disabled={loading}
                  className="btn-oro"
                >
                  {loading ? '⏳ Actualizando...' : '💾 Guardar Resultado'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle pronosticable */}
      <div className="card-argentina p-6">
        <h3 className="text-xl font-bold mb-4">🔒 Gestionar Partidos Pronosticables</h3>
        <p className="text-gray-600 mb-4">
          Habilita o deshabilita la posibilidad de hacer pronósticos en cada partido.
        </p>

        {matches.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span>{match.homeFlag}</span>
                  <span className="font-semibold text-sm">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  <span>{match.awayFlag}</span>
                </div>

                <button
                  onClick={() => handleTogglePronosticable(match.id)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    match.isPronosticable
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                >
                  {match.isPronosticable ? '✅ Habilitado' : '🔒 Deshabilitado'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Cargá los partidos primero</p>
        )}
      </div>
    </div>
  );
};

