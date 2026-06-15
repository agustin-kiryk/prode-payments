// Tipos TypeScript para el frontend
// Similar a DTOs en Java

export interface User {
  id: number;
  name: string;
  avatar: string;
  color: string;
  createdAt: string;
}

export interface Match {
  id: number;
  apiFootballId?: number;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  stadium?: string;
  stage: string;
  group?: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  isPronosticable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: number;
  userId: number;
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  match?: Match;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  avatar: string;
  color: string;
  totalPoints: number;
  totalPredictions: number;
  exactResults: number;
  partialResults: number;
  wrongResults: number;
}

export interface ProdeStats {
  totalMatches: number;
  finishedMatches: number;
  pendingMatches: number;
  totalPredictions: number;
  totalUsers: number;
  averagePredictionsPerMatch: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface MatchPredictionStats {
  totalPredictions: number;
  avgHomeScore: string;
  avgAwayScore: string;
  homeWins: number;
  awayWins: number;
  draws: number;
}

// Eventos de Socket.IO
export interface NewPredictionEvent {
  userName: string;
  userAvatar: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}

