"use client";

import { useState, useEffect } from "react";
import {
  subscribeToGames,
  subscribeToTeams,
  subscribeToPlayers,
  subscribeToGameStats,
} from "@/lib/gameService";
import type { Game, Team, Player, PlayerGameStats } from "@/lib/types";

export default function AdminStatsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allStats, setAllStats] = useState<Record<string, Record<string, PlayerGameStats>>>({});
  const [selectedGameId, setSelectedGameId] = useState<string>("all");

  useEffect(() => {
    const unsubs = [
      subscribeToGames(setGames),
      subscribeToTeams(setTeams),
      subscribeToPlayers(setPlayers),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    const active = games.filter((g) => g.status === "live" || g.status === "final");
    const unsubs = active.map((g) =>
      subscribeToGameStats(g.id, (stats) =>
        setAllStats((prev) => ({ ...prev, [g.id]: stats }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [games]);

  const activeGames = games.filter((g) => g.status === "live" || g.status === "final");

  const relevantStats: Record<string, PlayerGameStats> = {};
  const gameEntries = selectedGameId === "all" ? Object.entries(allStats) : [[selectedGameId, allStats[selectedGameId] || {}] as const];

  for (const [, gameStats] of gameEntries) {
    for (const [playerId, s] of Object.entries(gameStats as Record<string, PlayerGameStats>)) {
      if (!relevantStats[playerId]) {
        relevantStats[playerId] = { pts: 0, fgm: 0, fga: 0, twoPm: 0, twoPa: 0, threePm: 0, threePa: 0, ftm: 0, fta: 0, reb: 0, oreb: 0, dreb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0, tf: 0 };
      }
      const a = relevantStats[playerId];
      a.pts += s.pts || 0;
      a.fgm += s.fgm || 0;
      a.fga += s.fga || 0;
      a.twoPm += s.twoPm || 0;
      a.twoPa += s.twoPa || 0;
      a.threePm += s.threePm || 0;
      a.threePa += s.threePa || 0;
      a.ftm += s.ftm || 0;
      a.fta += s.fta || 0;
      a.reb += s.reb || 0;
      a.oreb += s.oreb || 0;
      a.dreb += s.dreb || 0;
      a.ast += s.ast || 0;
      a.stl += s.stl || 0;
      a.blk += s.blk || 0;
      a.to += s.to || 0;
      a.pf += s.pf || 0;
      a.tf += s.tf || 0;
    }
  }

  const ranked = Object.entries(relevantStats)
    .map(([playerId, s]) => ({
      playerId,
      stats: s,
      player: players.find((p) => p.id === playerId),
      team: teams.find((t) => t.id === players.find((p) => p.id === playerId)?.teamId),
    }))
    .filter((r) => r.player)
    .sort((a, b) => b.stats.pts - a.stats.pts);

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-bold">Stats</h2>

      <select
        value={selectedGameId}
        onChange={(e) => setSelectedGameId(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-loc-card border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
      >
        <option value="all">All Games</option>
        {activeGames.map((g) => {
          const h = teams.find((t) => t.id === g.homeTeamId);
          const a = teams.find((t) => t.id === g.awayTeamId);
          return (
            <option key={g.id} value={g.id}>
              {h?.name || "Home"} vs {a?.name || "Away"} ({g.status})
            </option>
          );
        })}
      </select>

      {ranked.length === 0 ? (
        <p className="text-sm text-loc-muted text-center py-12">No stats recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-loc-muted uppercase tracking-wider border-b border-loc-border">
                <th className="text-left px-2 py-2 font-medium">Player</th>
                <th className="text-center px-1 py-2 font-medium">PTS</th>
                <th className="text-center px-1 py-2 font-medium">REB</th>
                <th className="text-center px-1 py-2 font-medium">AST</th>
                <th className="text-center px-1 py-2 font-medium">STL</th>
                <th className="text-center px-1 py-2 font-medium">BLK</th>
                <th className="text-center px-1 py-2 font-medium">FG</th>
                <th className="text-center px-1 py-2 font-medium">FT</th>
                <th className="text-center px-1 py-2 font-medium">PF</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r) => (
                <tr key={r.playerId} className="border-b border-loc-border/30">
                  <td className="px-2 py-2 font-medium whitespace-nowrap">
                    <span className="text-loc-muted mr-1">#{r.player!.number}</span>
                    {r.player!.name.split(" ").pop()}
                    <span className="text-loc-muted/60 ml-1 text-[10px]">{r.team?.shortName}</span>
                  </td>
                  <td className="text-center px-1 py-2 font-bold text-loc-green">{r.stats.pts}</td>
                  <td className="text-center px-1 py-2">{r.stats.reb}</td>
                  <td className="text-center px-1 py-2">{r.stats.ast}</td>
                  <td className="text-center px-1 py-2">{r.stats.stl}</td>
                  <td className="text-center px-1 py-2">{r.stats.blk}</td>
                  <td className="text-center px-1 py-2 text-loc-muted">{r.stats.fgm}/{r.stats.fga}</td>
                  <td className="text-center px-1 py-2 text-loc-muted">{r.stats.ftm}/{r.stats.fta}</td>
                  <td className="text-center px-1 py-2">{r.stats.pf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
