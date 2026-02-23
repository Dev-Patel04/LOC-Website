export interface Team {
  id: string;
  name: string;
  shortName: string;
  color?: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  teamId: string;
}

export type GameStatus = "scheduled" | "live" | "final";

export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  status: GameStatus;
  date: string;
}

export interface PlayerGameStats {
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgm: number;
  fga: number;
  threePm: number;
  threePa: number;
  ftm: number;
  fta: number;
  fouls: number;
}

export interface Play {
  id: string;
  playerId: string;
  playerName: string;
  description: string;
  assistBy?: string;
  time: string;
  quarter: number;
  timestamp: number;
  statType: string;
  value: number;
}

export const DEFAULT_STATS: PlayerGameStats = {
  pts: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  fgm: 0,
  fga: 0,
  threePm: 0,
  threePa: 0,
  ftm: 0,
  fta: 0,
  fouls: 0,
};
