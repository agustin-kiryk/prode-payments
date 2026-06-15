// Componente principal de la aplicación
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { Leaderboard } from './components/Leaderboard';
import { MatchesPage } from './pages/MatchesPage';
import { ConfigPage } from './pages/ConfigPage';
import { getUsers } from './utils/api';
import { useSocket } from './hooks/useSocket';
import type { User, NewPredictionEvent } from './types';
import './styles/index.css';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('matches');
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  // Socket.IO para notificaciones en tiempo real
  useSocket(
    // onNewPrediction
    (data: NewPredictionEvent) => {
      toast(
        <div className="flex items-center gap-3">
          <span className="text-2xl">{data.userAvatar}</span>
          <div>
            <p className="font-bold">{data.userName} pronosticó:</p>
            <p className="text-sm">
              {data.homeFlag} {data.predictedHomeScore} - {data.predictedAwayScore} {data.awayFlag}
            </p>
          </div>
        </div>,
        {
          icon: '⚽',
          duration: 4000,
        }
      );
    },
    // onLeaderboardUpdate
    () => {
      setLeaderboardRefresh((prev) => prev + 1);
      toast.success('📊 Tabla de posiciones actualizada', {
        icon: '🏆',
      });
    }
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      
      // Seleccionar primer usuario por defecto
      if (data.length > 0 && !selectedUser) {
        setSelectedUser(data[0]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  const handlePredictionSaved = () => {
    setLeaderboardRefresh((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-celeste">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1E3A8A',
            fontWeight: '600',
          },
        }}
      />

      <Header
        users={users}
        selectedUser={selectedUser}
        onUserSelect={setSelectedUser}
      />

      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'matches' && (
          <MatchesPage
            selectedUser={selectedUser}
            onPredictionSaved={handlePredictionSaved}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard refreshTrigger={leaderboardRefresh} />
        )}

        {activeTab === 'config' && <ConfigPage />}
      </main>

      {/* Footer argentino mejorado */}
      <footer className="bg-gradient-to-br from-celeste-afa via-azul-oscuro to-celeste-dark text-white py-12 mt-16 border-t-4 border-amarillo-oro">
        <div className="container mx-auto px-4">
          {/* Leyendas */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-6 text-5xl mb-6">
              <span className="animate-bounce">🇦🇷</span>
              <span className="animate-pulse">⚽</span>
              <span className="animate-bounce delay-100">🏆</span>
              <span className="animate-pulse delay-100">⭐</span>
              <span className="animate-bounce delay-200">⭐</span>
              <span className="animate-pulse delay-200">⭐</span>
            </div>

            <h3 className="text-4xl font-black mb-4 argentina-shine">
              CREDIT-PAYMENTS PRODE MUNDIAL 2026
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl mb-2">🐐</div>
                <div className="font-bold text-xl">LIONEL MESSI</div>
                <div className="text-sm text-celeste-light">El mejor de todos los tiempos</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl mb-2">👑</div>
                <div className="font-bold text-xl">DIEGO MARADONA</div>
                <div className="text-sm text-celeste-light">Eterno D10S del fútbol</div>
              </div>
            </div>
          </div>

          {/* Frases */}
          <div className="text-center mb-6">
            <p className="text-xl italic font-semibold mb-2">
              "La pelota no se mancha, la gloria es eterna" 💙
            </p>
            <p className="text-lg text-celeste-light mb-4">
              Hecho con 💙 para los hinchas argentinos
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-4 py-2 bg-white/20 rounded-full">⚽ Qatar 2022</span>
              <span className="px-4 py-2 bg-white/20 rounded-full">🏆 3 Copas del Mundo</span>
              <span className="px-4 py-2 bg-white/20 rounded-full">🔟 La Scaloneta</span>
              <span className="px-4 py-2 bg-white/20 rounded-full">🧉 Argentina Campeón</span>
            </div>
          </div>

          {/* Grito final */}
          <div className="text-center">
            <p className="text-3xl font-black text-amarillo-oro animate-pulse">
              ¡VAMOS ARGENTINA CARAJO! 🎉
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

