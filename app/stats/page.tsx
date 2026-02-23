"use client";

import { useState, useEffect } from "react";
import {
  subscribeToGames,
  subscribeToTeams,
  subscribeToPlayers,
  subscribeToGameStats,
} from "@/lib/gameService";
import { Game, Team, Player, PlayerGameStats, DEFAULT_STATS } from "@/lib/types";

type SortKey = "gp" | "wins" | "losses" | "pts" | "fgm" | "fga" | "fgPct" | "twoPm" | "twoPa" | "twoPct" | "threePm" | "threePa" | "threePct" | "ftm" | "fta" | "ftPct" | "reb" | "oreb" | "dreb" | "ast" | "stl" | "blk" | "to" | "pf" | "tf";

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

  const aggregated: Record<string, PlayerGameStats & { gp: number; wins: number; losses: number; fgPct: number; twoPct: number; threePct: number; ftPct: number; }> = {};

  Object.entries(allStats).forEach(([gameId, gameStats]) => {
    const game = games.find((g) => g.id === gameId);

    Object.entries(gameStats).forEach(([playerId, s]) => {
      if (!aggregated[playerId]) {
        aggregated[playerId] = { ...DEFAULT_STATS, gp: 0, wins: 0, losses: 0, fgPct: 0, twoPct: 0, threePct: 0, ftPct: 0 };
      }
      const a = aggregated[playerId];
      a.gp += 1;

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

      if (game && game.status === "final") {
        const player = players.find((p) => p.id === playerId);
        if (player) {
          const isHome = game.homeTeamId === player.teamId;
          const isAway = game.awayTeamId === player.teamId;
          if (isHome) {
            if (game.homeScore > game.awayScore) a.wins += 1;
            else if (game.homeScore < game.awayScore) a.losses += 1;
          } else if (isAway) {
            if (game.awayScore > game.homeScore) a.wins += 1;
            else if (game.awayScore < game.homeScore) a.losses += 1;
          }
        }
      }
    });
  });

  // Calculate percentages
  Object.values(aggregated).forEach((a) => {
    a.fgPct = a.fga > 0 ? (a.fgm / a.fga) * 100 : 0;
    a.twoPct = a.twoPa > 0 ? (a.twoPm / a.twoPa) * 100 : 0;
    a.threePct = a.threePa > 0 ? (a.threePm / a.threePa) * 100 : 0;
    a.ftPct = a.fta > 0 ? (a.ftm / a.fta) * 100 : 0;
  });

  const ranked = Object.entries(aggregated)
    .map(([playerId, s]) => {
      const player = players.find((p) => p.id === playerId);
      const team = player ? teams.find((t) => t.id === player.teamId) : undefined;
      return { playerId, stats: s, player, team };
    })
    .filter((r) => r.player)
    .sort((a, b) => (b.stats[sortBy] || 0) - (a.stats[sortBy] || 0));

  const Th = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th
      onClick={() => setSortBy(sortKey)}
      className={`px-3 py-3 font-semibold text-xs tracking-wider cursor-pointer hover:text-white transition-colors ${sortBy === sortKey ? "text-loc-accent uppercase border-b-2 border-loc-accent" : "text-loc-muted uppercase"
        }`}
    >
      {label}
    </th>
  );

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-loc-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        League Stats
      </h2>

      {ranked.length === 0 ? (
        <p className="text-loc-muted text-sm py-16 text-center bg-loc-card rounded-xl border border-loc-border">
          No stats available yet. Stats will appear once games are played.
        </p>
      ) : (
        <div className="bg-loc-card rounded-xl border border-loc-border overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-loc-card-light/30 border-b border-loc-border">
                <tr>
                  <th className="px-3 py-3 font-semibold text-xs tracking-wider text-loc-muted uppercase sticky left-0 z-10 bg-loc-card">Player</th>
                  {/* Basic */}
                  <th className="px-3 py-3 font-semibold text-xs tracking-wider text-loc-muted uppercase">Team</th>
                  <th className="px-3 py-3 font-semibold text-xs tracking-wider text-loc-muted uppercase">Div</th>
                  <Th label="GP" sortKey="gp" />
                  <Th label="W" sortKey="wins" />
                  <Th label="L" sortKey="losses" />

                  {/* Pts & Shooting */}
                  <Th label="PTS" sortKey="pts" />
                  <Th label="FGM" sortKey="fgm" />
                  <Th label="FGA" sortKey="fga" />
                  <Th label="FG%" sortKey="fgPct" />
                  <Th label="2PM" sortKey="twoPm" />
                  <Th label="2PA" sortKey="twoPa" />
                  <Th label="2P%" sortKey="twoPct" />
                  <Th label="3PM" sortKey="threePm" />
                  <Th label="3PA" sortKey="threePa" />
                  <Th label="3P%" sortKey="threePct" />
                  <Th label="FTM" sortKey="ftm" />
                  <Th label="FTA" sortKey="fta" />
                  <Th label="FT%" sortKey="ftPct" />

                  {/* Rebounding & Other */}
                  <Th label="REB" sortKey="reb" />
                  <Th label="OREB" sortKey="oreb" />
                  <Th label="DREB" sortKey="dreb" />
                  <Th label="AST" sortKey="ast" />
                  <Th label="STL" sortKey="stl" />
                  <Th label="BLK" sortKey="blk" />
                  <Th label="TO" sortKey="to" />
                  <Th label="PF" sortKey="pf" />
                  <Th label="TF" sortKey="tf" />
                </tr>
              </thead>
              <tbody className="divide-y divide-loc-border/50">
                {ranked.map((r, i) => (
                  <tr key={r.playerId} className="hover:bg-loc-card-light/30 transition-colors group">
                    <td className="px-3 py-2.5 font-bold sticky left-0 z-10 bg-loc-card group-hover:bg-loc-card-light/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-loc-muted w-4">{i + 1}</span>
                        <span>{r.player!.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-loc-muted text-xs">{r.team?.shortName || "-"}</td>
                    <td className="px-3 py-2.5 text-loc-muted text-xs">{r.team?.division || "-"}</td>
                    <td className="px-3 py-2.5 font-medium">{r.stats.gp}</td>
                    <td className="px-3 py-2.5 font-medium">{r.stats.wins}</td>
                    <td className="px-3 py-2.5 font-medium">{r.stats.losses}</td>

                    <td className="px-3 py-2.5 font-bold text-white">{r.stats.pts}</td>
                    <td className="px-3 py-2.5">{r.stats.fgm}</td>
                    <td className="px-3 py-2.5">{r.stats.fga}</td>
                    <td className="px-3 py-2.5">{r.stats.fgPct.toFixed(1)}</td>
                    <td className="px-3 py-2.5">{r.stats.twoPm}</td>
                    <td className="px-3 py-2.5">{r.stats.twoPa}</td>
                    <td className="px-3 py-2.5">{r.stats.twoPct.toFixed(1)}</td>
                    <td className="px-3 py-2.5">{r.stats.threePm}</td>
                    <td className="px-3 py-2.5">{r.stats.threePa}</td>
                    <td className="px-3 py-2.5">{r.stats.threePct.toFixed(1)}</td>
                    <td className="px-3 py-2.5">{r.stats.ftm}</td>
                    <td className="px-3 py-2.5">{r.stats.fta}</td>
                    <td className="px-3 py-2.5">{r.stats.ftPct.toFixed(1)}</td>

                    <td className="px-3 py-2.5 font-bold text-white">{r.stats.reb}</td>
                    <td className="px-3 py-2.5">{r.stats.oreb}</td>
                    <td className="px-3 py-2.5">{r.stats.dreb}</td>
                    <td className="px-3 py-2.5 font-bold text-white">{r.stats.ast}</td>
                    <td className="px-3 py-2.5 font-bold text-white">{r.stats.stl}</td>
                    <td className="px-3 py-2.5 font-bold text-white">{r.stats.blk}</td>
                    <td className="px-3 py-2.5">{r.stats.to}</td>
                    <td className="px-3 py-2.5">{r.stats.pf}</td>
                    <td className="px-3 py-2.5">{r.stats.tf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
