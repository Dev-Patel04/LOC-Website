"use client";

import { useState, useEffect } from "react";
import {
  subscribeToGames,
  subscribeToTeams,
  subscribeToPlayers,
  subscribeToGameStats,
  subscribeToRecentPlays,
} from "@/lib/gameService";
import type { Game, Team, Player, PlayerGameStats, Play } from "@/lib/types";
import LiveScoreCard from "@/components/LiveScoreCard";
import RecentPlays from "@/components/RecentPlays";
import TopPerformers from "@/components/TopPerformers";

export default function ScoresPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allStats, setAllStats] = useState<Record<string, Record<string, PlayerGameStats>>>({});
  const [allPlays, setAllPlays] = useState<Record<string, Play[]>>({});

  useEffect(() => {
    const unsubs = [
      subscribeToGames(setGames),
      subscribeToTeams(setTeams),
      subscribeToPlayers(setPlayers),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    const liveGames = games.filter((g) => g.status === "live" || g.status === "final");
    const unsubs = liveGames.flatMap((g) => [
      subscribeToGameStats(g.id, (stats) =>
        setAllStats((prev) => ({ ...prev, [g.id]: stats }))
      ),
      subscribeToRecentPlays(g.id, (plays) =>
        setAllPlays((prev) => ({ ...prev, [g.id]: plays }))
      ),
    ]);
    return () => unsubs.forEach((u) => u());
  }, [games]);

  const liveGames = games.filter((g) => g.status === "live");
  const finalGames = games.filter((g) => g.status === "final");
  const scheduledGames = games.filter((g) => g.status === "scheduled");

  const primaryGame = liveGames[0] || finalGames[0];

  return (
    <div className="px-4 py-4">
      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-16 h-16 text-loc-muted mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 10.5h-1.5A3.375 3.375 0 007.5 14.25v4.5m9 0H7.5" />
          </svg>
          <h2 className="text-lg font-semibold text-loc-muted mb-1">No Games Yet</h2>
          <p className="text-sm text-loc-muted/70">Games will appear here once the admin creates them.</p>
        </div>
      )}

      {primaryGame && (
        <>
          <LiveScoreCard
            game={primaryGame}
            homeTeam={teams.find((t) => t.id === primaryGame.homeTeamId)}
            awayTeam={teams.find((t) => t.id === primaryGame.awayTeamId)}
          />
          <RecentPlays plays={allPlays[primaryGame.id] || []} />
          <TopPerformers
            gameId={primaryGame.id}
            stats={allStats[primaryGame.id] || {}}
            players={players}
            teams={teams}
          />
        </>
      )}

      {liveGames.length > 1 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted mb-3">Other Live Games</h3>
          <div className="space-y-3">
            {liveGames.slice(1).map((g) => (
              <LiveScoreCard
                key={g.id}
                game={g}
                homeTeam={teams.find((t) => t.id === g.homeTeamId)}
                awayTeam={teams.find((t) => t.id === g.awayTeamId)}
              />
            ))}
          </div>
        </div>
      )}

      {finalGames.length > (primaryGame?.status === "final" ? 1 : 0) && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted mb-3">Final</h3>
          <div className="space-y-3">
            {finalGames
              .filter((g) => g.id !== primaryGame?.id)
              .map((g) => (
                <LiveScoreCard
                  key={g.id}
                  game={g}
                  homeTeam={teams.find((t) => t.id === g.homeTeamId)}
                  awayTeam={teams.find((t) => t.id === g.awayTeamId)}
                />
              ))}
          </div>
        </div>
      )}

      {scheduledGames.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted mb-3">Upcoming</h3>
          <div className="space-y-3">
            {scheduledGames.map((g) => (
              <LiveScoreCard
                key={g.id}
                game={g}
                homeTeam={teams.find((t) => t.id === g.homeTeamId)}
                awayTeam={teams.find((t) => t.id === g.awayTeamId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
