"use client";

import type { Play } from "@/lib/types";

interface RecentPlaysProps {
  plays: Play[];
}

export default function RecentPlays({ plays }: RecentPlaysProps) {
  if (plays.length === 0) return null;

  return (
    <div className="bg-loc-card rounded-2xl border border-loc-border p-5 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-loc-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted">Recent Plays</h3>
      </div>

      <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar">
        {plays.slice(0, 10).map((play, i) => (
          <div key={play.id} className="flex items-start gap-3">
            <div
              className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${
                i === 0 ? "bg-loc-accent" : "bg-loc-border"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className={i === 0 ? "text-loc-accent font-semibold" : "text-white font-medium"}>
                  {play.playerName}
                </span>{" "}
                <span className="text-gray-300">{play.description.replace(play.playerName, "").trim()}</span>
              </p>
              <p className="text-[11px] text-loc-muted mt-0.5 uppercase tracking-wide">
                {play.time}
                {play.assistBy && ` · Assist by ${play.assistBy}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
