// Servicio para integración con Football-Data.org
// Similar a un @Service en Spring Boot

import axios, { AxiosInstance } from 'axios';
import { Match } from '@prisma/client';

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED, LIVE, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED
  matchday: number;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string; // Three Letter Abbreviation
    crest: string;
  } | null; // Puede ser null en fases eliminatorias donde aún no se conocen los equipos
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  } | null; // Puede ser null en fases eliminatorias donde aún no se conocen los equipos
  score: {
    winner: string | null;
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
  venue: string | null;
}

// Mapeo de códigos de país a emojis de banderas (Mundial 2026)
const countryFlags: Record<string, string> = {
  // América
  'Argentina': '🇦🇷',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'USA': '🇺🇸',
  'Canada': '🇨🇦',
  'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴',
  'Chile': '🇨🇱',
  'Ecuador': '🇪🇨',
  'Peru': '🇵🇪',
  'Paraguay': '🇵🇾',
  'Venezuela': '🇻🇪',
  'Bolivia': '🇧🇴',
  'Costa Rica': '🇨🇷',
  'Jamaica': '🇯🇲',
  'Panama': '🇵🇦',
  'Honduras': '🇭🇳',
  'Trinidad and Tobago': '🇹🇹',

  // Europa
  'Spain': '🇪🇸',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Italy': '🇮🇹',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Croatia': '🇭🇷',
  'Poland': '🇵🇱',
  'Switzerland': '🇨🇭',
  'Denmark': '🇩🇰',
  'Sweden': '🇸🇪',
  'Austria': '🇦🇹',
  'Czech Republic': '🇨🇿',
  'Serbia': '🇷🇸',
  'Ukraine': '🇺🇦',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Norway': '🇳🇴',
  'Romania': '🇷🇴',
  'Greece': '🇬🇷',
  'Turkey': '🇹🇷',
  'Russia': '🇷🇺',

  // África
  'Morocco': '🇲🇦',
  'Senegal': '🇸🇳',
  'Tunisia': '🇹🇳',
  'Nigeria': '🇳🇬',
  'Algeria': '🇩🇿',
  'Egypt': '🇪🇬',
  'Ghana': '🇬🇭',
  'Cameroon': '🇨🇲',
  'Ivory Coast': '🇨🇮',
  'Mali': '🇲🇱',
  'Burkina Faso': '🇧🇫',
  'South Africa': '🇿🇦',

  // Asia
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Iran': '🇮🇷',
  'Australia': '🇦🇺',
  'Saudi Arabia': '🇸🇦',
  'Qatar': '🇶🇦',
  'Iraq': '🇮🇶',
  'United Arab Emirates': '🇦🇪',
  'China': '🇨🇳',
  'Jordan': '🇯🇴',
  'Uzbekistan': '🇺🇿',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
  'Oman': '🇴🇲',
  'India': '🇮🇳',

  // Oceanía
  'New Zealand': '🇳🇿',
};

export class FootballApiService {
  private api: AxiosInstance;
  private readonly WORLD_CUP_CODE = 'WC'; // Código del Mundial en Football-Data.org
  private readonly SEASON = 2026;

  constructor() {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    const baseURL = 'https://api.football-data.org/v4';

    if (!apiKey || apiKey === 'tu_api_key_aqui') {
      console.error('❌ FOOTBALL_DATA_API_KEY no configurada o usa valor de ejemplo');
      console.error('📖 Obtener API key gratis en: https://www.football-data.org/');
      throw new Error('FOOTBALL_DATA_API_KEY no configurada');
    }

    this.api = axios.create({
      baseURL,
      headers: {
        'X-Auth-Token': apiKey,
      },
      timeout: 15000, // 15 segundos
    });
  }

  /**
   * Obtener fixtures del Mundial 2026
   * Similar a un método de un Repository en Spring
   */
  async getWorldCupFixtures(): Promise<Partial<Match>[]> {
    try {
      console.log('🔄 Sincronizando partidos desde Football-Data.org...');
      console.log(`📡 Competition: ${this.WORLD_CUP_CODE}, Season: ${this.SEASON}`);

      // Football-Data.org usa: /competitions/{code}/matches
      const response = await this.api.get(`/competitions/${this.WORLD_CUP_CODE}/matches`, {
        params: {
          season: this.SEASON,
        },
      });

      console.log(`✅ Respuesta recibida: ${response.data.matches?.length || 0} partidos`);

      const matches: FootballDataMatch[] = response.data.matches;

      if (!matches || matches.length === 0) {
        console.warn('⚠️ No se encontraron partidos para el Mundial 2026');
        console.warn('💡 Tip: El Mundial 2026 puede no tener datos aún en la API');
        console.warn('💡 Puedes usar datos de ejemplo con: npx prisma db seed');
        return [];
      }

      return matches.map(match => this.mapToMatch(match));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error al obtener fixtures:');
        console.error('   Status:', error.response?.status);
        console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('   Message:', error.message);

        if (error.code === 'ECONNABORTED') {
          throw new Error('⏱️ Timeout: La API tardó mucho en responder (>15s)');
        }
        if (error.response?.status === 403 || error.response?.status === 401) {
          throw new Error('🔐 API Key inválida o sin permisos. Verificar backend/.env');
        }
        if (error.response?.status === 429) {
          throw new Error('🚫 Límite de requests excedido (10/minuto en plan gratuito)');
        }
        if (error.response?.status === 404) {
          throw new Error('🤷 Mundial 2026 aún no disponible en la API. Usar datos de ejemplo.');
        }
      }
      throw new Error('No se pudo obtener fixtures de Football-Data.org. Ver logs para más detalles.');
    }
  }

  /**
   * Obtener un partido específico por ID
   */
  async getMatchById(matchId: number): Promise<Partial<Match>> {
    try {
      const response = await this.api.get(`/matches/${matchId}`);
      const match: FootballDataMatch = response.data;
      return this.mapToMatch(match);
    } catch (error) {
      console.error('❌ Error al obtener partido:', error);
      throw new Error('No se pudo obtener el partido');
    }
  }

  /**
   * Mapear respuesta de Football-Data.org a modelo interno
   * Similar a un DTO Mapper en Java
   */
  private mapToMatch(match: FootballDataMatch): Partial<Match> {
    const stage = this.parseStage(match.stage);

    // Manejar equipos TBD (To Be Determined) en fases eliminatorias
    const homeTeamName = match.homeTeam?.name;
    const awayTeamName = match.awayTeam?.name;

    // Verificar si el partido se puede pronosticar
    // TRUE si: tiene equipos definidos Y está programado (no empezó ni terminó)
    const canPredict = !!(homeTeamName && awayTeamName &&
                         (match.status === 'SCHEDULED' || match.status === 'TIMED'));

    return {
      apiFootballId: match.id || undefined,
      homeTeam: homeTeamName || undefined,
      awayTeam: awayTeamName || undefined,
      homeFlag: homeTeamName ? (countryFlags[homeTeamName] || '🏴') : '🏴',
      awayFlag: awayTeamName ? (countryFlags[awayTeamName] || '🏴') : '🏴',
      date: new Date(match.utcDate),
      stadium: match.venue || undefined,
      stage,
      group: match.group || undefined,
      homeScore: match.score.fullTime.home || undefined,
      awayScore: match.score.fullTime.away || undefined,
      status: this.mapStatus(match.status),
      isPronosticable: canPredict,
    };
  }

  /**
   * Parsear la fase del torneo
   */
  private parseStage(stage: string): string {
    const stageMap: Record<string, string> = {
      'GROUP_STAGE': 'Group Stage',
      'LAST_16': 'Round of 16',
      'QUARTER_FINALS': 'Quarter-finals',
      'SEMI_FINALS': 'Semi-finals',
      'FINAL': 'Final',
      'THIRD_PLACE': 'Third Place',
    };
    return stageMap[stage] || stage;
  }

  /**
   * Mapear status de Football-Data.org a formato interno
   */
  private mapStatus(apiStatus: string): string {
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'scheduled',     // Programado
      'TIMED': 'scheduled',          // Con horario definido
      'IN_PLAY': 'live',             // En juego
      'PAUSED': 'live',              // Pausado (medio tiempo)
      'FINISHED': 'finished',        // Finalizado
      'POSTPONED': 'postponed',      // Pospuesto
      'SUSPENDED': 'cancelled',      // Suspendido
      'CANCELLED': 'cancelled',      // Cancelado
    };

    return statusMap[apiStatus] || 'scheduled';
  }

  /**
   * Verificar límite de tasa de API (10 requests/minuto en plan gratuito)
   */
  async checkApiStatus(): Promise<{ remaining: number; limit: number }> {
    // Football-Data.org no tiene endpoint de status
    // Los límites se informan en los headers de respuesta
    console.log('ℹ️ Football-Data.org: 10 requests/minuto en plan gratuito');
    return { remaining: 10, limit: 10 };
  }
}

