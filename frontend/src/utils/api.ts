// Servicio de API para el frontend
// Similar a un RestTemplate o FeignClient en Spring

import axios from 'axios';
import type {
  ApiResponse,
  User,
  Match,
  Prediction,
  LeaderboardEntry,
  ProdeStats,
  MatchPredictionStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging (similar a Interceptor en Spring)
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Error en API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// === USUARIOS ===
export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<ApiResponse<User[]>>('/users');
  return data.data || [];
};

export const getUserById = async (id: number): Promise<User> => {
  const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
  return data.data!;
};

// === PARTIDOS ===
export const getMatches = async (stage?: string, status?: string): Promise<Match[]> => {
  const { data } = await api.get<ApiResponse<Match[]>>('/matches', {
    params: { stage, status },
  });
  return data.data || [];
};

export const getMatchById = async (id: number): Promise<Match> => {
  const { data } = await api.get<ApiResponse<Match>>(`/matches/${id}`);
  return data.data!;
};

export const getStages = async (): Promise<string[]> => {
  const { data } = await api.get<ApiResponse<string[]>>('/matches/stages');
  return data.data || [];
};

// === PRONÓSTICOS ===
export const createPrediction = async (prediction: {
  userId: number;
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
}): Promise<Prediction> => {
  const { data } = await api.post<ApiResponse<Prediction>>('/predictions', prediction);
  return data.data!;
};

export const getUserPredictions = async (userId: number): Promise<Prediction[]> => {
  const { data } = await api.get<ApiResponse<Prediction[]>>(`/predictions/user/${userId}`);
  return data.data || [];
};

export const getMatchPredictions = async (matchId: number): Promise<Prediction[]> => {
  const { data } = await api.get<ApiResponse<Prediction[]>>(`/predictions/match/${matchId}`);
  return data.data || [];
};

export const getMatchPredictionStats = async (matchId: number): Promise<MatchPredictionStats> => {
  const { data } = await api.get<ApiResponse<MatchPredictionStats>>(
    `/predictions/match/${matchId}/stats`
  );
  return data.data!;
};

export const checkPrediction = async (
  userId: number,
  matchId: number
): Promise<boolean> => {
  const { data } = await api.get<ApiResponse<{ hasPrediction: boolean }>>(
    `/predictions/check/${userId}/${matchId}`
  );
  return data.data?.hasPrediction || false;
};

// === LEADERBOARD ===
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard/all');
  return data.data || [];
};

export const getProdeStats = async (): Promise<ProdeStats> => {
  const { data } = await api.get<ApiResponse<ProdeStats>>('/users/stats/prode');
  return data.data!;
};

// === ADMIN ===
export const syncMatches = async (adminToken: string): Promise<{ created: number; updated: number }> => {
  const { data } = await api.post<ApiResponse<{ created: number; updated: number }>>(
    '/matches/admin/sync',
    {},
    {
      headers: {
        'x-admin-token': adminToken,
      },
    }
  );
  return data.data!;
};

export const updateMatchResult = async (
  matchId: number,
  homeScore: number,
  awayScore: number,
  adminToken: string
): Promise<Match> => {
  const { data } = await api.put<ApiResponse<Match>>(
    `/matches/admin/${matchId}/result`,
    { homeScore, awayScore },
    {
      headers: {
        'x-admin-token': adminToken,
      },
    }
  );
  return data.data!;
};

export const togglePronosticable = async (
  matchId: number,
  adminToken: string
): Promise<Match> => {
  const { data } = await api.patch<ApiResponse<Match>>(
    `/matches/admin/${matchId}/toggle-pronosticable`,
    {},
    {
      headers: {
        'x-admin-token': adminToken,
      },
    }
  );
  return data.data!;
};

export const fixPronosticable = async (adminToken: string): Promise<{ total: number; fixed: number }> => {
  const { data } = await api.post<ApiResponse<{ total: number; fixed: number }>>(
    '/matches/admin/fix-pronosticable',
    {},
    {
      headers: {
        'x-admin-token': adminToken,
      },
    }
  );
  return data.data!;
};

export default api;

