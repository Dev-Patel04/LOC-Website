"use client";

import { useState, useEffect } from "react";
import {
  subscribeToTeams,
  subscribeToPlayers,
  createTeam,
  updateTeam,
  deleteTeam,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/lib/gameService";
import type { Team, Player } from "@/lib/types";

export default function RosterPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    const unsubs = [subscribeToTeams(setTeams), subscribeToPlayers(setPlayers)];
    return () => unsubs.forEach((u) => u());
  }, []);

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Teams Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Teams</h2>
          <button
            onClick={() => setShowAddTeam(!showAddTeam)}
            className="px-3 py-1.5 rounded-lg bg-loc-accent text-white text-xs font-semibold"
          >
            {showAddTeam ? "Cancel" : "+ Add Team"}
          </button>
        </div>

        {showAddTeam && (
          <TeamForm onSave={() => setShowAddTeam(false)} />
        )}

        {editingTeam && (
          <TeamForm
            team={editingTeam}
            onSave={() => setEditingTeam(null)}
            onCancel={() => setEditingTeam(null)}
          />
        )}

        {teams.length === 0 && !showAddTeam && (
          <p className="text-sm text-loc-muted text-center py-8">No teams yet. Add a team to get started.</p>
        )}

        <div className="space-y-2">
          {teams.map((t) => (
            <TeamCard
              key={t.id}
              team={t}
              playerCount={players.filter((p) => p.teamId === t.id).length}
              onEdit={() => setEditingTeam(t)}
              onDelete={() => deleteTeam(t.id)}
            />
          ))}
        </div>
      </div>

      {/* Players Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Players</h2>
          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="px-3 py-1.5 rounded-lg bg-loc-accent text-white text-xs font-semibold"
          >
            {showAddPlayer ? "Cancel" : "+ Add Player"}
          </button>
        </div>

        {showAddPlayer && (
          <PlayerForm teams={teams} onSave={() => setShowAddPlayer(false)} />
        )}

        {teams.map((team) => {
          const teamPlayers = players.filter((p) => p.teamId === team.id);
          if (teamPlayers.length === 0) return null;
          return (
            <div key={team.id} className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-loc-muted mb-2">
                {team.name}
              </h3>
              <div className="space-y-1.5">
                {teamPlayers.map((p) => (
                  <PlayerCard key={p.id} player={p} teams={teams} />
                ))}
              </div>
            </div>
          );
        })}

        {players.length === 0 && !showAddPlayer && (
          <p className="text-sm text-loc-muted text-center py-8">No players yet.</p>
        )}
      </div>
    </div>
  );
}

function TeamForm({
  team,
  onSave,
  onCancel,
}: {
  team?: Team;
  onSave: () => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(team?.name || "");
  const [shortName, setShortName] = useState(team?.shortName || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) return;
    setLoading(true);
    try {
      if (team) {
        await updateTeam(team.id, { name: name.trim(), shortName: shortName.trim().toUpperCase() });
      } else {
        await createTeam({ name: name.trim(), shortName: shortName.trim().toUpperCase() });
      }
      onSave();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-loc-card rounded-xl border border-loc-border p-4 space-y-3 mb-3">
      <div>
        <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Team Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Stallions"
          className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Short Name (3 letters)</label>
        <input
          value={shortName}
          onChange={(e) => setShortName(e.target.value.slice(0, 4))}
          required
          placeholder="e.g. STL"
          maxLength={4}
          className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm uppercase focus:outline-none focus:border-loc-accent"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-loc-accent text-white text-xs font-semibold disabled:opacity-50">
          {loading ? "Saving..." : team ? "Update" : "Add Team"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg bg-loc-card-light text-loc-muted text-xs font-semibold border border-loc-border">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function TeamCard({
  team,
  playerCount,
  onEdit,
  onDelete,
}: {
  team: Team;
  playerCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-loc-card rounded-xl border border-loc-border px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-loc-card-light border border-loc-border flex items-center justify-center">
        <span className="text-xs font-bold text-loc-accent">{team.shortName}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{team.name}</p>
        <p className="text-[11px] text-loc-muted">{playerCount} player{playerCount !== 1 ? "s" : ""}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="text-xs text-loc-accent hover:underline">Edit</button>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="text-xs text-red-400/60 hover:text-red-400">
            Delete
          </button>
        ) : (
          <div className="flex gap-1">
            <button onClick={onDelete} className="text-xs text-red-400 font-semibold">Yes</button>
            <button onClick={() => setConfirming(false)} className="text-xs text-loc-muted">No</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerForm({ teams, player, onSave }: { teams: Team[]; player?: Player; onSave: () => void }) {
  const [name, setName] = useState(player?.name || "");
  const [number, setNumber] = useState(player?.number?.toString() || "");
  const [position, setPosition] = useState(player?.position || "Guard");
  const [teamId, setTeamId] = useState(player?.teamId || teams[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !number || !teamId) return;
    setLoading(true);
    try {
      if (player) {
        await updatePlayer(player.id, { name: name.trim(), number: parseInt(number), position, teamId });
      } else {
        await createPlayer({ name: name.trim(), number: parseInt(number), position, teamId });
      }
      onSave();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-loc-card rounded-xl border border-loc-border p-4 space-y-3 mb-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Marcus Thompson"
            className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Number</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            min={0}
            max={99}
            placeholder="23"
            className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Position</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
          >
            <option>Guard</option>
            <option>Forward</option>
            <option>Center</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1">Team</label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-loc-bg border border-loc-border text-white text-sm focus:outline-none focus:border-loc-accent"
          >
            <option value="">Select team...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-2 rounded-lg bg-loc-accent text-white text-xs font-semibold disabled:opacity-50">
        {loading ? "Saving..." : player ? "Update Player" : "Add Player"}
      </button>
    </form>
  );
}

function PlayerCard({ player, teams }: { player: Player; teams: Team[] }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (editing) {
    return <PlayerForm teams={teams} player={player} onSave={() => setEditing(false)} />;
  }

  return (
    <div className="bg-loc-card rounded-xl border border-loc-border px-4 py-3 flex items-center gap-3">
      <span className="text-xl font-bold text-loc-accent tabular-nums w-9 text-center">{player.number}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{player.name}</p>
        <p className="text-[11px] text-loc-muted">{player.position}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="text-xs text-loc-accent hover:underline">Edit</button>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="text-xs text-red-400/60 hover:text-red-400">
            Delete
          </button>
        ) : (
          <div className="flex gap-1">
            <button onClick={() => { deletePlayer(player.id); setConfirming(false); }} className="text-xs text-red-400 font-semibold">
              Yes
            </button>
            <button onClick={() => setConfirming(false)} className="text-xs text-loc-muted">No</button>
          </div>
        )}
      </div>
    </div>
  );
}
