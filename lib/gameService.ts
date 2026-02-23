import {
  ref,
  onValue,
  set,
  push,
  update,
  get,
  remove,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp,
  DatabaseReference,
} from "firebase/database";
import { db } from "./firebase";
import type { Game, Team, Player, PlayerGameStats, Play, DEFAULT_STATS } from "./types";
import { DEFAULT_STATS as defaultStats } from "./types";

// ---------- Refs ----------

export const gamesRef = () => ref(db, "games");
export const gameRef = (gameId: string) => ref(db, `games/${gameId}`);
export const teamsRef = () => ref(db, "teams");
export const teamRef = (teamId: string) => ref(db, `teams/${teamId}`);
export const playersRef = () => ref(db, "players");
export const playerRef = (playerId: string) => ref(db, `players/${playerId}`);
export const gameStatsRef = (gameId: string) => ref(db, `gameStats/${gameId}`);
export const playerGameStatsRef = (gameId: string, playerId: string) =>
  ref(db, `gameStats/${gameId}/${playerId}`);
export const recentPlaysRef = (gameId: string) => ref(db, `recentPlays/${gameId}`);

// ---------- Subscribe helpers ----------

export function subscribeToGames(callback: (games: Game[]) => void) {
  return onValue(gamesRef(), (snapshot) => {
    const data = snapshot.val();
    if (!data) return callback([]);
    const games = Object.entries(data).map(([id, g]) => ({
      id,
      ...(g as Omit<Game, "id">),
    }));
    callback(games);
  });
}

export function subscribeToGame(gameId: string, callback: (game: Game | null) => void) {
  return onValue(gameRef(gameId), (snapshot) => {
    const data = snapshot.val();
    if (!data) return callback(null);
    callback({ id: gameId, ...data } as Game);
  });
}

export function subscribeToTeams(callback: (teams: Team[]) => void) {
  return onValue(teamsRef(), (snapshot) => {
    const data = snapshot.val();
    if (!data) return callback([]);
    const teams = Object.entries(data).map(([id, t]) => ({
      id,
      ...(t as Omit<Team, "id">),
    }));
    callback(teams);
  });
}

export function subscribeToPlayers(callback: (players: Player[]) => void) {
  return onValue(playersRef(), (snapshot) => {
    const data = snapshot.val();
    if (!data) return callback([]);
    const players = Object.entries(data).map(([id, p]) => ({
      id,
      ...(p as Omit<Player, "id">),
    }));
    callback(players);
  });
}

export function subscribeToGameStats(
  gameId: string,
  callback: (stats: Record<string, PlayerGameStats>) => void
) {
  return onValue(gameStatsRef(gameId), (snapshot) => {
    callback(snapshot.val() || {});
  });
}

export function subscribeToRecentPlays(gameId: string, callback: (plays: Play[]) => void) {
  return onValue(recentPlaysRef(gameId), (snapshot) => {
    const data = snapshot.val();
    if (!data) return callback([]);
    const plays = Object.entries(data)
      .map(([id, p]) => ({ id, ...(p as Omit<Play, "id">) }))
      .sort((a, b) => b.timestamp - a.timestamp);
    callback(plays);
  });
}

// ---------- Write helpers ----------

export async function createGame(game: Omit<Game, "id">) {
  const newRef = push(gamesRef());
  await set(newRef, game);
  return newRef.key!;
}

export async function updateGame(gameId: string, data: Partial<Game>) {
  await update(gameRef(gameId), data);
}

export async function deleteGame(gameId: string) {
  await remove(gameRef(gameId));
  await remove(gameStatsRef(gameId));
  await remove(recentPlaysRef(gameId));
}

export async function createTeam(team: Omit<Team, "id">) {
  const newRef = push(teamsRef());
  await set(newRef, team);
  return newRef.key!;
}

export async function updateTeam(teamId: string, data: Partial<Team>) {
  await update(teamRef(teamId), data);
}

export async function deleteTeam(teamId: string) {
  await remove(teamRef(teamId));
}

export async function createPlayer(player: Omit<Player, "id">) {
  const newRef = push(playersRef());
  await set(newRef, player);
  return newRef.key!;
}

export async function updatePlayer(playerId: string, data: Partial<Player>) {
  await update(playerRef(playerId), data);
}

export async function deletePlayer(playerId: string) {
  await remove(playerRef(playerId));
}

// ---------- Scoring ----------

export interface StatAction {
  gameId: string;
  playerId: string;
  playerName: string;
  statType: "2ptMake" | "2ptMiss" | "3ptMake" | "3ptMiss" | "ftMake" | "ftMiss" | "oreb" | "dreb" | "ast" | "stl" | "blk" | "to" | "pf" | "tf";
  quarter: number;
  timeRemaining: string;
  teamSide: "home" | "away";
}

export async function recordStat(action: StatAction): Promise<{ playKey: string }> {
  const statsPath = `gameStats/${action.gameId}/${action.playerId}`;
  const snapshot = await get(ref(db, statsPath));
  const current: PlayerGameStats = snapshot.val() || { ...defaultStats };

  const updates: Record<string, unknown> = {};
  let pointsToAdd = 0;
  let description = "";

  switch (action.statType) {
    case "2ptMake":
      current.pts += 2;
      current.fgm += 1;
      current.fga += 1;
      current.twoPm += 1;
      current.twoPa += 1;
      pointsToAdd = 2;
      description = `${action.playerName} made a 2-pt shot`;
      break;
    case "2ptMiss":
      current.fga += 1;
      current.twoPa += 1;
      description = `${action.playerName} missed a 2-pt shot`;
      break;
    case "3ptMake":
      current.pts += 3;
      current.fgm += 1;
      current.fga += 1;
      current.threePm += 1;
      current.threePa += 1;
      pointsToAdd = 3;
      description = `${action.playerName} made a 3-pt shot`;
      break;
    case "3ptMiss":
      current.fga += 1;
      current.threePa += 1;
      description = `${action.playerName} missed a 3-pt shot`;
      break;
    case "ftMake":
      current.pts += 1;
      current.ftm += 1;
      current.fta += 1;
      pointsToAdd = 1;
      description = `${action.playerName} made a free throw`;
      break;
    case "ftMiss":
      current.fta += 1;
      description = `${action.playerName} missed a free throw`;
      break;
    case "oreb":
      current.oreb += 1;
      current.reb += 1;
      description = `${action.playerName} grabbed an offensive rebound`;
      break;
    case "dreb":
      current.dreb += 1;
      current.reb += 1;
      description = `${action.playerName} grabbed a defensive rebound`;
      break;
    case "ast":
      current.ast += 1;
      description = `${action.playerName} recorded an assist`;
      break;
    case "stl":
      current.stl += 1;
      description = `${action.playerName} got a steal`;
      break;
    case "blk":
      current.blk += 1;
      description = `${action.playerName} blocked a shot`;
      break;
    case "to":
      current.to += 1;
      description = `${action.playerName} turned the ball over`;
      break;
    case "pf":
      current.pf += 1;
      description = `${action.playerName} personal foul (P${current.pf})`;
      break;
    case "tf":
      current.tf += 1;
      description = `${action.playerName} technical foul (T${current.tf})`;
      break;
  }

  updates[statsPath] = current;

  if (pointsToAdd > 0) {
    const scoreField = action.teamSide === "home" ? "homeScore" : "awayScore";
    const gameSnap = await get(gameRef(action.gameId));
    const gameData = gameSnap.val();
    if (gameData) {
      updates[`games/${action.gameId}/${scoreField}`] = (gameData[scoreField] || 0) + pointsToAdd;
    }
  }

  const playRef = push(recentPlaysRef(action.gameId));
  const play: Omit<Play, "id"> = {
    playerId: action.playerId,
    playerName: action.playerName,
    description,
    time: action.timeRemaining,
    quarter: action.quarter,
    timestamp: Date.now(),
    statType: action.statType,
    value: pointsToAdd || 1,
  };
  updates[`recentPlays/${action.gameId}/${playRef.key}`] = play;

  await update(ref(db), updates);
  return { playKey: playRef.key! };
}

export async function undoStat(action: StatAction & { playKey: string }) {
  const statsPath = `gameStats/${action.gameId}/${action.playerId}`;
  const snapshot = await get(ref(db, statsPath));
  const current: PlayerGameStats = snapshot.val() || { ...defaultStats };

  let pointsToRemove = 0;

  switch (action.statType) {
    case "2ptMake":
      current.pts = Math.max(0, current.pts - 2);
      current.fgm = Math.max(0, current.fgm - 1);
      current.fga = Math.max(0, current.fga - 1);
      current.twoPm = Math.max(0, current.twoPm - 1);
      current.twoPa = Math.max(0, current.twoPa - 1);
      pointsToRemove = 2;
      break;
    case "2ptMiss":
      current.fga = Math.max(0, current.fga - 1);
      current.twoPa = Math.max(0, current.twoPa - 1);
      break;
    case "3ptMake":
      current.pts = Math.max(0, current.pts - 3);
      current.fgm = Math.max(0, current.fgm - 1);
      current.fga = Math.max(0, current.fga - 1);
      current.threePm = Math.max(0, current.threePm - 1);
      current.threePa = Math.max(0, current.threePa - 1);
      pointsToRemove = 3;
      break;
    case "3ptMiss":
      current.fga = Math.max(0, current.fga - 1);
      current.threePa = Math.max(0, current.threePa - 1);
      break;
    case "ftMake":
      current.pts = Math.max(0, current.pts - 1);
      current.ftm = Math.max(0, current.ftm - 1);
      current.fta = Math.max(0, current.fta - 1);
      pointsToRemove = 1;
      break;
    case "ftMiss":
      current.fta = Math.max(0, current.fta - 1);
      break;
    case "oreb":
      current.oreb = Math.max(0, current.oreb - 1);
      current.reb = Math.max(0, current.reb - 1);
      break;
    case "dreb":
      current.dreb = Math.max(0, current.dreb - 1);
      current.reb = Math.max(0, current.reb - 1);
      break;
    case "ast":
      current.ast = Math.max(0, current.ast - 1);
      break;
    case "stl":
      current.stl = Math.max(0, current.stl - 1);
      break;
    case "blk":
      current.blk = Math.max(0, current.blk - 1);
      break;
    case "to":
      current.to = Math.max(0, current.to - 1);
      break;
    case "pf":
      current.pf = Math.max(0, current.pf - 1);
      break;
    case "tf":
      current.tf = Math.max(0, current.tf - 1);
      break;
  }

  const updates: Record<string, unknown> = {};
  updates[statsPath] = current;

  if (pointsToRemove > 0) {
    const scoreField = action.teamSide === "home" ? "homeScore" : "awayScore";
    const gameSnap = await get(gameRef(action.gameId));
    const gameData = gameSnap.val();
    if (gameData) {
      updates[`games/${action.gameId}/${scoreField}`] = Math.max(
        0,
        (gameData[scoreField] || 0) - pointsToRemove
      );
    }
  }

  updates[`recentPlays/${action.gameId}/${action.playKey}`] = null;

  await update(ref(db), updates);
}
