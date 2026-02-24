"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  subscribeToGame,
  subscribeToTeams,
  subscribeToPlayers,
  subscribeToGameStats,
  subscribeToRecentPlays,
} from "@/lib/gameService";
import type { Game, Team, Player, PlayerGameStats, Play } from "@/lib/types";
import TeamLogo from "@/components/TeamLogo";

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Record<string, PlayerGameStats>>({});
  const [plays, setPlays] = useState<Play[]>([]);
  const [selectedTab, setSelectedTab] = useState<"box" | "plays">("box");
  const [displayTime, setDisplayTime] = useState("");

  useEffect(() => {
    if (!game) return;
    if (!game.isTimerRunning || !game.timerEndsAt) {
      setDisplayTime(game.timeRemaining);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const differenceMs = game.timerEndsAt! - now;

      if (differenceMs <= 0) {
        setDisplayTime("0:00");
        clearInterval(interval);
        return;
      }

      const totalSeconds = Math.floor(differenceMs / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      setDisplayTime(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);

    setDisplayTime((prev) => {
      const differenceMs = game.timerEndsAt! - Date.now();
      if (differenceMs <= 0) return "0:00";
      const totalSeconds = Math.floor(differenceMs / 1000);
      return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
    });

    return () => clearInterval(interval);
  }, [game?.isTimerRunning, game?.timerEndsAt, game?.timeRemaining, game?.id]);

  useEffect(() => {
    const unsubs = [
      subscribeToGame(gameId, setGame),
      subscribeToTeams(setTeams),
      subscribeToPlayers(setPlayers),
      subscribeToGameStats(gameId, setStats),
      subscribeToRecentPlays(gameId, setPlays),
    ];
    return () => unsubs.forEach((u) => u());
  }, [gameId]);

  if (!game) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-loc-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t) => t.id === game.awayTeamId);
  const homePlayers = players.filter((p) => p.teamId === game.homeTeamId);
  const awayPlayers = players.filter((p) => p.teamId === game.awayTeamId);

  return (
    <div className="px-4 py-4">
      <Link href="/scores" className="text-loc-accent text-sm mb-4 inline-flex items-center gap-1 hover:underline">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Scores
      </Link>

      <div className="bg-loc-card rounded-2xl border border-loc-border p-6 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <TeamLogo team={homeTeam} className="w-20 h-20 mb-3" />
            <span className="text-xs uppercase tracking-wider text-loc-muted font-medium">
              {homeTeam?.name || "TBD"}
            </span>
            <span className="text-5xl font-bold mt-1 tabular-nums">{game.homeScore}</span>
          </div>
          <div className="text-loc-muted text-xl">&mdash;</div>
          <div className="flex flex-col items-center flex-1">
            <TeamLogo team={awayTeam} className="w-20 h-20 mb-3" />
            <span className="text-xs uppercase tracking-wider text-loc-muted font-medium">
              {awayTeam?.name || "TBD"}
            </span>
            <span className="text-5xl font-bold mt-1 tabular-nums">{game.awayScore}</span>
          </div>
        </div>
        {game.status === "live" && (
          <p className="text-center text-sm text-loc-accent mt-3 font-medium">
            Q{game.quarter} &mdash; <span className="tabular-nums">{displayTime}</span>
          </p>
        )}
        {game.status === "final" && (
          <p className="text-center text-sm text-loc-muted mt-3 font-medium uppercase">Final</p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setSelectedTab("box")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${selectedTab === "box"
            ? "bg-loc-accent text-white"
            : "bg-loc-card text-loc-muted border border-loc-border"
            }`}
        >
          Box Score
        </button>
        <button
          onClick={() => setSelectedTab("plays")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${selectedTab === "plays"
            ? "bg-loc-accent text-white"
            : "bg-loc-card text-loc-muted border border-loc-border"
            }`}
        >
          Play-by-Play
        </button>
      </div>

      {selectedTab === "box" && (
        <div className="mt-4 space-y-4">
          <TeamBoxScore teamName={homeTeam?.name || "Home"} players={homePlayers} stats={stats} />
          <TeamBoxScore teamName={awayTeam?.name || "Away"} players={awayPlayers} stats={stats} />
        </div>
      )}

      {selectedTab === "plays" && (
        <div className="mt-4 space-y-2">
          {plays.length === 0 && (
            <p className="text-loc-muted text-sm text-center py-8">No plays recorded yet.</p>
          )}
          {plays.map((play) => (
            <div key={play.id} className="bg-loc-card rounded-xl border border-loc-border px-4 py-3">
              <p className="text-sm">
                <span className="font-semibold text-loc-accent">{play.playerName}</span>{" "}
                <span className="text-gray-300">{play.description.replace(play.playerName, "").trim()}</span>
              </p>
              <p className="text-[11px] text-loc-muted mt-1 uppercase tracking-wide">
                Q{play.quarter} &middot; {play.time}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamBoxScore({
  teamName,
  players,
  stats,
}: {
  teamName: string;
  players: Player[];
  stats: Record<string, PlayerGameStats>;
}) {
  return (
    <div className="bg-loc-card rounded-xl border border-loc-border overflow-hidden mt-4">
      <div className="px-4 py-2 bg-loc-card-light/50 border-b border-loc-border">
        <h4 className="text-sm font-bold uppercase tracking-widest text-loc-muted">{teamName}</h4>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-loc-card-light/20 border-b border-loc-border text-xs text-loc-muted uppercase">
            <tr>
              <th className="px-3 py-2 font-medium sticky left-0 z-10 bg-loc-card">Player</th>
              <th className="px-3 py-2 font-medium">PTS</th>
              <th className="px-3 py-2 font-medium">FGM</th>
              <th className="px-3 py-2 font-medium">FGA</th>
              <th className="px-3 py-2 font-medium">3PM</th>
              <th className="px-3 py-2 font-medium">3PA</th>
              <th className="px-3 py-2 font-medium">FTM</th>
              <th className="px-3 py-2 font-medium">FTA</th>
              <th className="px-3 py-2 font-medium">REB</th>
              <th className="px-3 py-2 font-medium">OREB</th>
              <th className="px-3 py-2 font-medium">AST</th>
              <th className="px-3 py-2 font-medium">STL</th>
              <th className="px-3 py-2 font-medium">BLK</th>
              <th className="px-3 py-2 font-medium">TO</th>
              <th className="px-3 py-2 font-medium">PF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-loc-border/40">
            {players.map((p) => {
              const s = stats[p.id] || {
                pts: 0, fgm: 0, fga: 0, twoPm: 0, twoPa: 0,
                threePm: 0, threePa: 0, ftm: 0, fta: 0,
                reb: 0, oreb: 0, dreb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0, tf: 0
              };
              return (
                <tr key={p.id} className="hover:bg-loc-card-light/20 transition-colors">
                  <td className="px-3 py-2 font-medium sticky left-0 z-10 bg-loc-card">
                    <span className="text-loc-muted text-[10px] w-4 inline-block">{p.number}</span>
                    <span className="ml-1">{p.name.split(" ").pop()}</span>
                  </td>
                  <td className="px-3 py-2 font-bold text-white">{s.pts}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.fgm}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.fga}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.threePm}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.threePa}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.ftm}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.fta}</td>
                  <td className="px-3 py-2 font-bold text-white">{s.reb}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.oreb}</td>
                  <td className="px-3 py-2 font-bold text-white">{s.ast}</td>
                  <td className="px-3 py-2 font-bold text-white">{s.stl}</td>
                  <td className="px-3 py-2 font-bold text-white">{s.blk}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.to}</td>
                  <td className="px-3 py-2 text-loc-muted">{s.pf}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
