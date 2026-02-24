export interface Team {
  id: string;
  name: string;
  shortName: string;
  color?: string;
  division?: string;
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
  isTimerRunning?: boolean;
  timerEndsAt?: number;
}

export interface PlayerGameStats {
  pts: number;
  fgm: number;
  fga: number;
  twoPm: number;
  twoPa: number;
  threePm: number;
  threePa: number;
  ftm: number;
  fta: number;
  reb: number;
  oreb: number;
  dreb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  pf: number;
  tf: number;
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
  fgm: 0,
  fga: 0,
  twoPm: 0,
  twoPa: 0,
  threePm: 0,
  threePa: 0,
  ftm: 0,
  fta: 0,
  reb: 0,
  oreb: 0,
  dreb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  to: 0,
  pf: 0,
  tf: 0,
};
