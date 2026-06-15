// Helper para emitir eventos de Socket.IO desde cualquier parte del backend
// Permite notificaciones en tiempo real a todos los clientes conectados

import { Server } from 'socket.io';

let io: Server | null = null;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

export const getSocketIO = (): Server | null => {
  return io;
};

// Eventos disponibles
export const SocketEvents = {
  NEW_PREDICTION: 'new-prediction',
  LEADERBOARD_UPDATE: 'leaderboard-update',
  MATCH_RESULT_UPDATE: 'match-result-update',
  MATCH_STATUS_CHANGE: 'match-status-change',
};

// Helper para emitir nueva predicción
export const emitNewPrediction = (data: any) => {
  if (io) {
    io.emit(SocketEvents.NEW_PREDICTION, data);
    console.log('📡 Evento emitido: nueva predicción');
  }
};

// Helper para emitir actualización de leaderboard
export const emitLeaderboardUpdate = () => {
  if (io) {
    io.emit(SocketEvents.LEADERBOARD_UPDATE);
    console.log('📡 Evento emitido: actualización de leaderboard');
  }
};

// Helper para emitir actualización de resultado
export const emitMatchResultUpdate = (matchId: number) => {
  if (io) {
    io.emit(SocketEvents.MATCH_RESULT_UPDATE, { matchId });
    console.log(`📡 Evento emitido: resultado actualizado para partido ${matchId}`);
  }
};

