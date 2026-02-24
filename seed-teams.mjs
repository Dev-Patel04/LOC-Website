import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push } from "firebase/database";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

async function seed() {
    console.log("Seeding teams...");
    for (const team of teams) {
        const newRef = push(ref(db, "teams"));
        await set(newRef, team);
        console.log(`Added \${team.name}`);
    }
    console.log("Done seeding teams.");
    process.exit(0);
}

seed().catch(console.error);
