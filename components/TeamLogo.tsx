"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";
import Image from "next/image";

interface TeamLogoProps {
    team: Team | undefined;
    className?: string;
}

export default function TeamLogo({ team, className }: TeamLogoProps) {
    const [imageError, setImageError] = useState(false);
    const initials = team ? team.shortName.slice(0, 3).toUpperCase() : "??";

    return (
        <div
            className={`rounded-xl bg-loc-card-light border border-loc-border flex items-center justify-center overflow-hidden relative ${className || "w-16 h-16"}`}
        >
            {team && !imageError ? (
                <Image
                    src={`/logos/${team.shortName.toLowerCase()}.png`}
                    alt={`${team.name} Logo`}
                    fill
                    className="object-contain p-1"
                    onError={() => setImageError(true)}
                />
            ) : (
                <span className="text-lg font-bold text-loc-muted">{initials}</span>
            )}
        </div>
    );
}
