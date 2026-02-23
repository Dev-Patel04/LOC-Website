"use client";

import { useState, useEffect, useCallback } from "react";
import {
  subscribeToGames,
  subscribeToTeams,
  subscribeToPlayers,
  subscribeToGameStats,
  subscribeToRecentPlays,
  recordStat,
  undoStat,
  updateGame,
  type StatAction,
} from "@/lib/gameService";
import type { Game, Team, Player, PlayerGameStats, Play } from "@/lib/types";

type StatType = StatAction["statType"];

interface UndoEntry {
  action: StatAction;
  playKey: string;
}

export default function ScorerPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Record<string, PlayerGameStats>>({});
  const [plays, setPlays] = useState<Play[]>([]);

  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<"home" | "away">("home");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const unsubs = [
      subscribeToGames(setGames),
      subscribeToTeams(setTeams),
      subscribeToPlayers(setPlayers),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const liveGames = games.filter((g) => g.status === "live");

  useEffect(() => {
    if (!selectedGameId && liveGames.length > 0) {
      setSelectedGameId(liveGames[0].id);
    }
  }, [liveGames, selectedGameId]);

  useEffect(() => {
    if (!selectedGameId) return;
    const unsubs = [
      subscribeToGameStats(selectedGameId, setStats),
      subscribeToRecentPlays(selectedGameId, setPlays),
    ];
    return () => unsubs.forEach((u) => u());
  }, [selectedGameId]);

  const selectedGame = games.find((g) => g.id === selectedGameId);
  const homeTeam = selectedGame ? teams.find((t) => t.id === selectedGame.homeTeamId) : undefined;
  const awayTeam = selectedGame ? teams.find((t) => t.id === selectedGame.awayTeamId) : undefined;

  const teamId = selectedSide === "home" ? selectedGame?.homeTeamId : selectedGame?.awayTeamId;
  const teamPlayers = players.filter((p) => p.teamId === teamId);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  const handleStatAction = useCallback(
    async (statType: StatType) => {
      if (!selectedPlayerId || !selectedGame || isRecording) return;

      const player = players.find((p) => p.id === selectedPlayerId);
      if (!player) return;

      setIsRecording(true);
      try {
        const action: StatAction = {
          gameId: selectedGame.id,
          playerId: selectedPlayerId,
          playerName: player.name,
          statType,
          quarter: selectedGame.quarter,
          timeRemaining: selectedGame.timeRemaining,
          teamSide: selectedSide,
        };
        const { playKey } = await recordStat(action);
        setUndoStack((prev) => [...prev, { action, playKey }]);
      } catch (err) {
        console.error("Failed to record stat:", err);
      } finally {
        setIsRecording(false);
      }
    },
    [selectedPlayerId, selectedGame, players, selectedSide, isRecording]
  );

  const handleUndo = useCallback(async () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;

    try {
      await undoStat({ ...last.action, playKey: last.playKey });
      setUndoStack((prev) => prev.slice(0, -1));
    } catch (err) {
      console.error("Failed to undo:", err);
    }
  }, [undoStack]);

  if (liveGames.length === 0) {
    return (
      <div className="px-4 py-4">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-16 h-16 text-loc-muted mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
          </svg>
          <h2 className="text-lg font-semibold text-loc-muted mb-1">No Live Games</h2>
          <p className="text-sm text-loc-muted/70 mb-4">
            Set a game to &quot;Live&quot; from the Config page to start scoring.
          </p>
          <a href="/admin/config" className="text-sm text-loc-accent hover:underline">
            Go to Config
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Game selector */}
      {liveGames.length > 1 && (
        <select
          value={selectedGameId}
          onChange={(e) => {
            setSelectedGameId(e.target.value);
            setSelectedPlayerId("");
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-loc-card border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
        >
          {liveGames.map((g) => {
            const h = teams.find((t) => t.id === g.homeTeamId);
            const a = teams.find((t) => t.id === g.awayTeamId);
            return (
              <option key={g.id} value={g.id}>
                {h?.name || "Home"} vs {a?.name || "Away"}
              </option>
            );
          })}
        </select>
      )}

      {/* Team toggle */}
      <div className="flex rounded-xl overflow-hidden border border-loc-border">
        <button
          onClick={() => {
            setSelectedSide("home");
            setSelectedPlayerId("");
          }}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            selectedSide === "home"
              ? "bg-loc-accent text-white"
              : "bg-loc-card text-loc-muted"
          }`}
        >
          {homeTeam?.name || "Home"} (HOME)
        </button>
        <button
          onClick={() => {
            setSelectedSide("away");
            setSelectedPlayerId("");
          }}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            selectedSide === "away"
              ? "bg-loc-accent text-white"
              : "bg-loc-card text-loc-muted"
          }`}
        >
          {awayTeam?.name || "Away"} (AWAY)
        </button>
      </div>

      {/* Scoring buttons */}
      <div className="grid grid-cols-3 gap-2">
        <StatButton label="+2" sublabel="PTS" onClick={() => handleStatAction("2pt")} disabled={!selectedPlayerId || isRecording} />
        <StatButton label="+3" sublabel="PTS" onClick={() => handleStatAction("3pt")} disabled={!selectedPlayerId || isRecording} />
        <StatButton label="FT" sublabel="MADE" onClick={() => handleStatAction("ft")} disabled={!selectedPlayerId || isRecording} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatButton label="REB" sublabel="BOARD" variant="secondary" onClick={() => handleStatAction("reb")} disabled={!selectedPlayerId || isRecording} />
        <StatButton label="AST" sublabel="DIME" variant="secondary" onClick={() => handleStatAction("ast")} disabled={!selectedPlayerId || isRecording} />
        <StatButton label="STL" sublabel="SWIPE" variant="secondary" onClick={() => handleStatAction("stl")} disabled={!selectedPlayerId || isRecording} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatButton label="BLK" sublabel="BLOCK" variant="secondary" onClick={() => handleStatAction("blk")} disabled={!selectedPlayerId || isRecording} />
        <StatButton label="FOUL" sublabel="PF" variant="danger" onClick={() => handleStatAction("foul")} disabled={!selectedPlayerId || isRecording} />
        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="flex flex-col items-center justify-center py-4 rounded-xl bg-loc-card border border-loc-border text-loc-muted hover:text-white hover:border-loc-accent/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-wider">Undo</span>
        </button>
      </div>

      {/* Player list */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted mb-2">
          Select Player
        </h3>
        <div className="space-y-1.5">
          {teamPlayers.length === 0 && (
            <p className="text-sm text-loc-muted text-center py-4">
              No players. Add players in the Roster tab.
            </p>
          )}
          {teamPlayers.map((p) => {
            const s = stats[p.id];
            const isSelected = selectedPlayerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlayerId(isSelected ? "" : p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  isSelected
                    ? "bg-loc-accent/10 border-loc-accent"
                    : "bg-loc-card border-loc-border hover:border-loc-accent/30"
                }`}
              >
                <span className="text-2xl font-bold text-loc-accent tabular-nums w-10 text-center">
                  {p.number}
                </span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-[11px] text-loc-muted">
                    {s
                      ? `${s.pts} PTS | ${s.reb} REB | ${s.ast} AST`
                      : "0 PTS | 0 REB | 0 AST"}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "border-loc-accent bg-loc-accent" : "border-loc-muted"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      {plays.length > 0 && (
        <div className="bg-loc-card rounded-xl border border-loc-border p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted mb-2">Recent</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
            {plays.slice(0, 5).map((play) => (
              <p key={play.id} className="text-xs text-gray-300">
                <span className="text-loc-accent font-medium">{play.playerName}</span>{" "}
                {play.description.replace(play.playerName, "").trim()}{" "}
                <span className="text-loc-muted">(Q{play.quarter} {play.time})</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatButton({
  label,
  sublabel,
  variant = "primary",
  onClick,
  disabled,
}: {
  label: string;
  sublabel: string;
  variant?: "primary" | "secondary" | "danger";
  onClick: () => void;
  disabled?: boolean;
}) {
  const base = "flex flex-col items-center justify-center py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-loc-accent/20 border border-loc-accent/40 text-loc-accent hover:bg-loc-accent/30",
    secondary: "bg-loc-card-light border border-loc-border text-white hover:border-loc-accent/30",
    danger: "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      <span className="text-xl">{label}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">{sublabel}</span>
    </button>
  );
}
