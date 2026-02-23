"use client";

import { useState, useEffect } from "react";
import { subscribeToGames, subscribeToTeams } from "@/lib/gameService";
import type { Game, Team } from "@/lib/types";
import Link from "next/link";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const unsubs = [subscribeToGames(setGames), subscribeToTeams(setTeams)];
    return () => unsubs.forEach((u) => u());
  }, []);

  const grouped = {
    live: games.filter((g) => g.status === "live"),
    scheduled: games.filter((g) => g.status === "scheduled"),
    final: games.filter((g) => g.status === "final"),
  };

  const getTeam = (id: string) => teams.find((t) => t.id === id);

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold mb-4">Games</h2>

      {games.length === 0 && (
        <p className="text-loc-muted text-sm text-center py-16">No games scheduled yet.</p>
      )}

      {grouped.live.length > 0 && (
        <Section title="Live Now">
          {grouped.live.map((g) => (
            <GameRow key={g.id} game={g} home={getTeam(g.homeTeamId)} away={getTeam(g.awayTeamId)} />
          ))}
        </Section>
      )}

      {grouped.scheduled.length > 0 && (
        <Section title="Upcoming">
          {grouped.scheduled.map((g) => (
            <GameRow key={g.id} game={g} home={getTeam(g.homeTeamId)} away={getTeam(g.awayTeamId)} />
          ))}
        </Section>
      )}

      {grouped.final.length > 0 && (
        <Section title="Completed">
          {grouped.final.map((g) => (
            <GameRow key={g.id} game={g} home={getTeam(g.homeTeamId)} away={getTeam(g.awayTeamId)} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function GameRow({
  game,
  home,
  away,
}: {
  game: Game;
  home: Team | undefined;
  away: Team | undefined;
}) {
  return (
    <Link href={`/game/${game.id}`}>
      <div className="bg-loc-card rounded-xl border border-loc-border px-4 py-3 flex items-center justify-between hover:border-loc-accent/30 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{home?.name || "TBD"}</span>
            {(game.status === "live" || game.status === "final") && (
              <span className="font-bold text-sm tabular-nums">{game.homeScore}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-sm">{away?.name || "TBD"}</span>
            {(game.status === "live" || game.status === "final") && (
              <span className="font-bold text-sm tabular-nums">{game.awayScore}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          {game.status === "live" && (
            <span className="text-[10px] font-bold text-loc-live uppercase px-2 py-0.5 rounded-full bg-loc-live/20">
              Live
            </span>
          )}
          {game.status === "final" && (
            <span className="text-[10px] font-bold text-loc-muted uppercase">Final</span>
          )}
          {game.status === "scheduled" && (
            <span className="text-[10px] text-loc-muted">{game.date}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
