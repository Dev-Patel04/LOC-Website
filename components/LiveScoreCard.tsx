"use client";

import { useState, useEffect } from "react";
import type { Game, Team } from "@/lib/types";
import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";

interface LiveScoreCardProps {
  game: Game;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
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

  // Local state to keep the timer ticking for viewers without querying the DB every second
  const [displayTime, setDisplayTime] = useState(game.timeRemaining);

  useEffect(() => {
    // If timer isn't running or we don't have an end time, just show the static time
    if (!game.isTimerRunning || !game.timerEndsAt) {
      setDisplayTime(game.timeRemaining);
      return;
    }

    // Timer is running, so we calculate time remaining locally
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

    // Initial tick to avoid a 1 second delay
    setDisplayTime((prev) => {
      const differenceMs = game.timerEndsAt! - Date.now();
      if (differenceMs <= 0) return "0:00";
      const totalSeconds = Math.floor(differenceMs / 1000);
      return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
    });

    return () => clearInterval(interval);
  }, [game.isTimerRunning, game.timerEndsAt, game.timeRemaining]);

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
            <span className="text-sm text-loc-accent font-medium mt-1">
              {game.quarter <= 4
                ? `${ordinal(game.quarter)} Quarter`
                : `OT${game.quarter - 4}`}{" "}
              &mdash; <span className="tabular-nums">{displayTime}</span> Remaining
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
