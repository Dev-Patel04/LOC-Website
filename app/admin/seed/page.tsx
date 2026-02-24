"use client";

import { useState } from "react";
import { getDatabase, ref, set, push } from "firebase/database";
import app from "@/lib/firebase";

const teams = [
    { name: "REXDALE RAPTORS", shortName: "REX", division: "West" },
    { name: "VAUGHAN TIGERS", shortName: "VAU", division: "West" },
    { name: "SCARBOROUGH SHOOTING STARS", shortName: "SSS", division: "East" },
    { name: "MARKHAM MAVERICKS", shortName: "MAR", division: "East" },
    { name: "PICKERING PATRIOTS", shortName: "PIC", division: "East" },
    { name: "OSHAWA GENERALS", shortName: "OSH", division: "East" },
    { name: "RICHMOND HILL RAMS", shortName: "RHR", division: "West" },
    { name: "AJAX ADMIRALS", shortName: "AJA", division: "East" },
    { name: "MILTON MAMBAS", shortName: "MIL", division: "West" },
    { name: "NORTH YORK RAVENS", shortName: "NYR", division: "East" },
    { name: "HAMILTON BULLDOGS", shortName: "HAM", division: "West" },
    { name: "MISSISSAUGA THUNDER", shortName: "MIS", division: "West" }
];

export default function SeedPage() {
    const [status, setStatus] = useState("Idle");

    const seedTeams = async () => {
        setStatus("Seeding...");
        try {
            const db = getDatabase(app);
            for (const team of teams) {
                const newRef = push(ref(db, "teams"));
                await set(newRef, team);
            }
            setStatus("Done! All 12 teams added to Firebase.");
        } catch (err: any) {
            console.error(err);
            setStatus("Error: " + err.message);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Seed Teams Database</h1>
            <p className="mb-4 text-gray-400">
                Clicking this button will push the 12 teams into your live Firebase Database.
                You MUST be logged in as an admin for this to work due to security rules.
            </p>
            <button
                onClick={seedTeams}
                className="px-6 py-3 bg-loc-accent text-white font-bold rounded-xl hover:bg-opacity-80 transition"
            >
                Seed Teams
            </button>
            <p className="mt-4 font-mono text-loc-live">{status}</p>
        </div>
    );
}
