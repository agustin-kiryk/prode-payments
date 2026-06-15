// Custom Hook para Socket.IO
// Similar a un Service bean en Spring inyectado con @Autowired

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { NewPredictionEvent } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export const useSocket = (
  onNewPrediction?: (data: NewPredictionEvent) => void,
  onLeaderboardUpdate?: () => void,
  onMatchResultUpdate?: (data: { matchId: number }) => void
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al servidor Socket.IO
    console.log('🔌 Conectando a Socket.IO:', SOCKET_URL);
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO desconectado');
    });

    // Escuchar eventos
    if (onNewPrediction) {
      socket.on('new-prediction', onNewPrediction);
    }

    if (onLeaderboardUpdate) {
      socket.on('leaderboard-update', onLeaderboardUpdate);
    }

    if (onMatchResultUpdate) {
      socket.on('match-result-update', onMatchResultUpdate);
    }

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando Socket.IO');
      socket.disconnect();
    };
  }, [onNewPrediction, onLeaderboardUpdate, onMatchResultUpdate]);

  return socketRef.current;
};

