"use client";

import type { Player, PlayerGameStats, Team } from "@/lib/types";
import Link from "next/link";

interface TopPerformersProps {
  gameId: string;
  stats: Record<string, PlayerGameStats>;
  players: Player[];
  teams: Team[];
}

export default function TopPerformers({ gameId, stats, players, teams }: TopPerformersProps) {
  const ranked = Object.entries(stats)
    .map(([playerId, s]) => {
      const player = players.find((p) => p.id === playerId);
      const team = player ? teams.find((t) => t.id === player.teamId) : undefined;
      return { playerId, stats: s, player, team };
    })
    .filter((r) => r.player)
    .sort((a, b) => b.stats.pts - a.stats.pts)
    .slice(0, 5);

  if (ranked.length === 0) return null;

  return (
    <div className="mt-6 px-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold">Top Performers</h3>
        <Link
          href={`/game/${gameId}`}
          className="text-xs font-bold text-loc-accent uppercase tracking-wider hover:underline"
        >
          Full Stats
        </Link>
      </div>

      <div className="space-y-2">
        {ranked.map((r) => (
          <div
            key={r.playerId}
            className="bg-loc-card rounded-xl border border-loc-border px-4 py-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-loc-card-light border border-loc-border flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-loc-muted">
                {r.player!.number}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {abbreviateName(r.player!.name)}
              </p>
              <p className="text-[11px] text-loc-muted uppercase tracking-wide">
                {r.player!.position} &middot; {r.team?.name || ""}
              </p>
            </div>

            <div className="flex gap-3 text-right">
              <StatValue value={r.stats.pts} label="PTS" highlight />
              <StatValue value={r.stats.reb} label="REB" />
              <StatValue value={r.stats.ast} label="AST" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatValue({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className={`text-sm font-bold tabular-nums ${highlight ? "text-loc-green" : "text-white"}`}>
        {value}
      </span>
      <span className="text-[9px] text-loc-muted uppercase tracking-wide">{label}</span>
    </div>
  );
}

function abbreviateName(name: string): string {
  const parts = name.split(" ");
  if (parts.length <= 1) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}
