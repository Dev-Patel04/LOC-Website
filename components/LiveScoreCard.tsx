"use client";

import type { Game, Team } from "@/lib/types";
import Link from "next/link";

interface LiveScoreCardProps {
  game: Game;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
}

function TeamLogo({ team, className }: { team: Team | undefined; className?: string }) {
  const initials = team ? team.shortName.slice(0, 2).toUpperCase() : "??";
  return (
    <div
      className={`w-16 h-16 rounded-xl bg-loc-card-light border border-loc-border flex items-center justify-center ${className || ""}`}
    >
      <span className="text-lg font-bold text-loc-muted">{initials}</span>
    </div>
  );
}

function QuarterProgress({ quarter }: { quarter: number }) {
  const progress = (quarter / 4) * 100;
  return (
    <div className="w-full max-w-[200px] h-1.5 bg-loc-card-light rounded-full overflow-hidden">
      <div
        className="h-full bg-loc-accent rounded-full transition-all duration-500"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

export default function LiveScoreCard({ game, homeTeam, awayTeam }: LiveScoreCardProps) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <Link href={`/game/${game.id}`} className="block">
      <div className="bg-gradient-to-b from-loc-card to-loc-bg rounded-2xl border border-loc-border p-6 relative overflow-hidden">
        {isLive && (
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-full bg-loc-live/20 text-loc-live text-xs font-bold uppercase tracking-wider border border-loc-live/30">
              Live
            </span>
          </div>
        )}
        {isFinal && (
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-full bg-loc-muted/20 text-loc-muted text-xs font-bold uppercase tracking-wider">
              Final
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <TeamLogo team={homeTeam} />
            <span className="text-xs uppercase tracking-wider text-loc-muted mt-2 font-medium">
              {homeTeam?.name || "TBD"}
            </span>
            <span className="text-4xl font-bold mt-1 tabular-nums">{game.homeScore}</span>
          </div>

          <div className="text-loc-muted text-2xl font-light px-2">&mdash;</div>

          <div className="flex flex-col items-center flex-1">
            <TeamLogo team={awayTeam} />
            <span className="text-xs uppercase tracking-wider text-loc-muted mt-2 font-medium">
              {awayTeam?.name || "TBD"}
            </span>
            <span className="text-4xl font-bold mt-1 tabular-nums">{game.awayScore}</span>
          </div>
        </div>

        {isLive && (
          <div className="flex flex-col items-center mt-5 gap-2">
            <span className="text-sm text-loc-accent font-medium">
              {game.quarter <= 4
                ? `${ordinal(game.quarter)} Quarter`
                : `OT${game.quarter - 4}`}{" "}
              &mdash; {game.timeRemaining} Remaining
            </span>
            <QuarterProgress quarter={game.quarter} />
          </div>
        )}

        {game.status === "scheduled" && (
          <div className="flex justify-center mt-4">
            <span className="text-sm text-loc-muted">{game.date}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
