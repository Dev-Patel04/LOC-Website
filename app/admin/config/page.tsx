"use client";

import { useState, useEffect } from "react";
import {
  subscribeToGames,
  subscribeToTeams,
  createGame,
  updateGame,
  deleteGame,
} from "@/lib/gameService";
import type { Game, Team } from "@/lib/types";

export default function ConfigPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const unsubs = [subscribeToGames(setGames), subscribeToTeams(setTeams)];
    return () => unsubs.forEach((u) => u());
  }, []);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Game Config</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 rounded-lg bg-loc-accent text-white text-xs font-semibold"
        >
          {showCreate ? "Cancel" : "+ New Game"}
        </button>
      </div>

      {showCreate && (
        <CreateGameForm
          teams={teams}
          onCreated={() => setShowCreate(false)}
        />
      )}

      {games.length === 0 && !showCreate && (
        <p className="text-sm text-loc-muted text-center py-12">
          No games yet. Create one to get started.
        </p>
      )}

      <div className="space-y-3">
        {games.map((g) => (
          <GameConfigCard key={g.id} game={g} teams={teams} />
        ))}
      </div>
    </div>
  );
}

function CreateGameForm({ teams, onCreated }: { teams: Team[]; onCreated: () => void }) {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return;
    setLoading(true);
    try {
      await createGame({
        homeTeamId,
        awayTeamId,
        homeScore: 0,
        awayScore: 0,
        quarter: 1,
        timeRemaining: "12:00",
        status: "scheduled",
        date,
      });
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="bg-loc-card rounded-xl border border-loc-border p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Home Team</label>
        <select
          value={homeTeamId}
          onChange={(e) => setHomeTeamId(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
        >
          <option value="">Select team...</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Away Team</label>
        <select
          value={awayTeamId}
          onChange={(e) => setAwayTeamId(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
        >
          <option value="">Select team...</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !homeTeamId || !awayTeamId}
        className="w-full py-2.5 rounded-lg bg-loc-accent text-white text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Game"}
      </button>
    </form>
  );
}

function GameConfigCard({ game, teams }: { game: Game; teams: Team[] }) {
  const [editing, setEditing] = useState(false);
  const [quarter, setQuarter] = useState(game.quarter);
  const [timeRemaining, setTimeRemaining] = useState(game.timeRemaining);
  const [confirming, setConfirming] = useState(false);

  const home = teams.find((t) => t.id === game.homeTeamId);
  const away = teams.find((t) => t.id === game.awayTeamId);

  const handleStatusChange = async (status: Game["status"]) => {
    await updateGame(game.id, { status });
  };

  const handleClockUpdate = async () => {
    await updateGame(game.id, { quarter, timeRemaining });
    setEditing(false);
  };

  const handleDelete = async () => {
    await deleteGame(game.id);
    setConfirming(false);
  };

  return (
    <div className="bg-loc-card rounded-xl border border-loc-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {home?.name || "TBD"} vs {away?.name || "TBD"}
          </p>
          <p className="text-xs text-loc-muted">
            {game.date} &middot; {game.homeScore} - {game.awayScore}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            game.status === "live"
              ? "bg-loc-live/20 text-loc-live"
              : game.status === "final"
              ? "bg-loc-muted/20 text-loc-muted"
              : "bg-loc-accent/20 text-loc-accent"
          }`}
        >
          {game.status}
        </span>
      </div>

      <div className="flex gap-2">
        {game.status === "scheduled" && (
          <button
            onClick={() => handleStatusChange("live")}
            className="flex-1 py-2 rounded-lg bg-loc-green/20 text-loc-green text-xs font-semibold border border-loc-green/30"
          >
            Start Game (Live)
          </button>
        )}
        {game.status === "live" && (
          <>
            <button
              onClick={() => setEditing(!editing)}
              className="flex-1 py-2 rounded-lg bg-loc-accent/20 text-loc-accent text-xs font-semibold border border-loc-accent/30"
            >
              Edit Clock
            </button>
            <button
              onClick={() => handleStatusChange("final")}
              className="flex-1 py-2 rounded-lg bg-loc-muted/20 text-loc-muted text-xs font-semibold border border-loc-muted/30"
            >
              End Game (Final)
            </button>
          </>
        )}
        {game.status === "final" && (
          <button
            onClick={() => handleStatusChange("live")}
            className="flex-1 py-2 rounded-lg bg-loc-accent/20 text-loc-accent text-xs font-semibold border border-loc-accent/30"
          >
            Reopen as Live
          </button>
        )}
      </div>

      {editing && game.status === "live" && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-medium text-loc-muted uppercase mb-1">Quarter</label>
              <input
                type="number"
                min={1}
                max={6}
                value={quarter}
                onChange={(e) => setQuarter(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-medium text-loc-muted uppercase mb-1">Time</label>
              <input
                type="text"
                value={timeRemaining}
                onChange={(e) => setTimeRemaining(e.target.value)}
                placeholder="12:00"
                className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
              />
            </div>
          </div>
          <button
            onClick={handleClockUpdate}
            className="w-full py-2 rounded-lg bg-loc-accent text-white text-xs font-semibold"
          >
            Update Clock
          </button>
        </div>
      )}

      <div className="pt-1 border-t border-loc-border/50">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
          >
            Delete game
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Are you sure?</span>
            <button onClick={handleDelete} className="text-xs font-semibold text-red-400 hover:underline">
              Yes, delete
            </button>
            <button onClick={() => setConfirming(false)} className="text-xs text-loc-muted hover:underline">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
