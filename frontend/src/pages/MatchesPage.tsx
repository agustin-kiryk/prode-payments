// Página de partidos con filtros
import { useState, useEffect } from 'react';
import { getMatches, getStages } from '../utils/api';
import type { Match, User } from '../types';
import { MatchCard } from '../components/MatchCard';
import { stageNames } from '../utils/helpers';

interface MatchesPageProps {
  selectedUser: User | null;
  onPredictionSaved: () => void;
}

export const MatchesPage = ({ selectedUser, onPredictionSaved }: MatchesPageProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [selectedStage]);

  const loadData = async () => {
    try {
      const [matchesData, stagesData] = await Promise.all([
        getMatches(),
        getStages(),
      ]);
      setMatches(matchesData);
      setStages(stagesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const data = await getMatches(
        selectedStage !== 'all' ? selectedStage : undefined
      );
      setMatches(data);
    } catch (error) {
      console.error('Error al cargar partidos:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-8xl mb-6">⚽</div>
        <h2 className="text-2xl font-bold text-celeste-afa">
          Cargando partidos del Mundial...
        </h2>
      </div>
    );
  }

  const pronosticableCount = matches.filter(m => m.isPronosticable).length;
  const finishedCount = matches.filter(m => m.status === 'finished').length;

  return (
    <div>
      {/* Stats y filtros */}
      <div className="card-argentina p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-celeste-afa">{matches.length}</div>
              <div className="text-sm text-gray-600">Total partidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-green-600">{pronosticableCount}</div>
              <div className="text-sm text-gray-600">Pronosticables</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-600">{finishedCount}</div>
              <div className="text-sm text-gray-600">Finalizados</div>
            </div>
          </div>

          {/* Filtro por fase */}
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Filtrar por fase:</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="input-argentina"
            >
              <option value="all">🏆 Todas las fases</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stageNames[stage] || stage}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de partidos */}
      {matches.length === 0 ? (
        <div className="card-argentina p-12 text-center">
          <div className="text-6xl mb-4">🏟️</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">
            No hay partidos disponibles
          </h3>
          <p className="text-gray-500">
            Usá el panel de configuración para sincronizar partidos desde la API
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              selectedUser={selectedUser}
              onPredictionSaved={() => {
                onPredictionSaved();
                loadMatches();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

