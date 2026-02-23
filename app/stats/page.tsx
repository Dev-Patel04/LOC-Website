"use client";

import { useState, useEffect } from "react";
import {
  subscribeToGames,
  subscribeToTeams,
  subscribeToPlayers,
  subscribeToGameStats,
} from "@/lib/gameService";
import type { Game, Team, Player, PlayerGameStats } from "@/lib/types";

type SortKey = "pts" | "reb" | "ast" | "stl" | "blk";

export default function StatsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allStats, setAllStats] = useState<Record<string, Record<string, PlayerGameStats>>>({});
  const [sortBy, setSortBy] = useState<SortKey>("pts");

  useEffect(() => {
    const unsubs = [
      subscribeToGames(setGames),
      subscribeToTeams(setTeams),
      subscribeToPlayers(setPlayers),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    const activeGames = games.filter((g) => g.status === "live" || g.status === "final");
    const unsubs = activeGames.map((g) =>
      subscribeToGameStats(g.id, (stats) =>
        setAllStats((prev) => ({ ...prev, [g.id]: stats }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [games]);

  const aggregated: Record<string, PlayerGameStats> = {};
  Object.values(allStats).forEach((gameStats) => {
    Object.entries(gameStats).forEach(([playerId, s]) => {
      if (!aggregated[playerId]) {
        aggregated[playerId] = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, fgm: 0, fga: 0, threePm: 0, threePa: 0, ftm: 0, fta: 0, fouls: 0 };
      }
      const a = aggregated[playerId];
      a.pts += s.pts || 0;
      a.reb += s.reb || 0;
      a.ast += s.ast || 0;
      a.stl += s.stl || 0;
      a.blk += s.blk || 0;
    });
  });

  const ranked = Object.entries(aggregated)
    .map(([playerId, s]) => {
      const player = players.find((p) => p.id === playerId);
      const team = player ? teams.find((t) => t.id === player.teamId) : undefined;
      return { playerId, stats: s, player, team };
    })
    .filter((r) => r.player)
    .sort((a, b) => (b.stats[sortBy] || 0) - (a.stats[sortBy] || 0));

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "pts", label: "Points" },
    { key: "reb", label: "Rebounds" },
    { key: "ast", label: "Assists" },
    { key: "stl", label: "Steals" },
    { key: "blk", label: "Blocks" },
  ];

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold mb-4">League Stats</h2>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${sortBy === opt.key
              ? "bg-loc-accent text-white"
              : "bg-loc-card text-loc-muted border border-loc-border"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {ranked.length === 0 ? (
        <p className="text-loc-muted text-sm text-center py-16">
          No stats available yet. Stats will appear once games are played.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {ranked.map((r, i) => (
            <div
              key={r.playerId}
              className="bg-loc-card rounded-xl border border-loc-border px-4 py-3 flex items-center gap-3"
            >
              <span className="text-lg font-bold text-loc-muted w-6 text-center tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.player!.name}</p>
                <p className="text-[11px] text-loc-muted uppercase tracking-wide">
                  #{r.player!.number} &middot; {r.team?.name || ""}
                </p>
              </div>
              <div className="flex gap-3">
                <StatBadge value={r.stats.pts} label="PTS" active={sortBy === "pts"} />
                <StatBadge value={r.stats.reb} label="REB" active={sortBy === "reb"} />
                <StatBadge value={r.stats.ast} label="AST" active={sortBy === "ast"} />
                <StatBadge value={r.stats.stl} label="STL" active={sortBy === "stl"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBadge({ value, label, active }: { value: number; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className={`text-sm font-bold tabular-nums ${active ? "text-loc-accent" : "text-white"}`}>
        {value}
      </span>
      <span className="text-[9px] text-loc-muted uppercase tracking-wide">{label}</span>
    </div>
  );
}
