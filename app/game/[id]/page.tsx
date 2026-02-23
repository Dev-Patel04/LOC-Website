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

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Record<string, PlayerGameStats>>({});
  const [plays, setPlays] = useState<Play[]>([]);
  const [selectedTab, setSelectedTab] = useState<"box" | "plays">("box");

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
            <span className="text-xs uppercase tracking-wider text-loc-muted font-medium">
              {homeTeam?.name || "TBD"}
            </span>
            <span className="text-5xl font-bold mt-1 tabular-nums">{game.homeScore}</span>
          </div>
          <div className="text-loc-muted text-xl">VS</div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs uppercase tracking-wider text-loc-muted font-medium">
              {awayTeam?.name || "TBD"}
            </span>
            <span className="text-5xl font-bold mt-1 tabular-nums">{game.awayScore}</span>
          </div>
        </div>
        {game.status === "live" && (
          <p className="text-center text-sm text-loc-accent mt-3 font-medium">
            Q{game.quarter} &mdash; {game.timeRemaining}
          </p>
        )}
        {game.status === "final" && (
          <p className="text-center text-sm text-loc-muted mt-3 font-medium uppercase">Final</p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setSelectedTab("box")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            selectedTab === "box"
              ? "bg-loc-accent text-white"
              : "bg-loc-card text-loc-muted border border-loc-border"
          }`}
        >
          Box Score
        </button>
        <button
          onClick={() => setSelectedTab("plays")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            selectedTab === "plays"
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
    <div className="bg-loc-card rounded-xl border border-loc-border overflow-hidden">
      <div className="px-4 py-2.5 bg-loc-card-light border-b border-loc-border">
        <h4 className="text-xs font-bold uppercase tracking-widest text-loc-muted">{teamName}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-loc-muted uppercase tracking-wider">
              <th className="text-left px-3 py-2 font-medium">Player</th>
              <th className="text-center px-2 py-2 font-medium">PTS</th>
              <th className="text-center px-2 py-2 font-medium">REB</th>
              <th className="text-center px-2 py-2 font-medium">AST</th>
              <th className="text-center px-2 py-2 font-medium">STL</th>
              <th className="text-center px-2 py-2 font-medium">BLK</th>
              <th className="text-center px-2 py-2 font-medium">FLS</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const s = stats[p.id] || { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, fouls: 0 };
              return (
                <tr key={p.id} className="border-t border-loc-border/50">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    <span className="text-loc-muted mr-1.5">#{p.number}</span>
                    {p.name.split(" ").pop()}
                  </td>
                  <td className="text-center px-2 py-2 font-bold text-loc-green">{s.pts}</td>
                  <td className="text-center px-2 py-2">{s.reb}</td>
                  <td className="text-center px-2 py-2">{s.ast}</td>
                  <td className="text-center px-2 py-2">{s.stl}</td>
                  <td className="text-center px-2 py-2">{s.blk}</td>
                  <td className="text-center px-2 py-2">{s.fouls}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
