"use client";

import { useState } from "react";

import type { TeamOwner } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({
  owner,
  size = "md",
}: {
  owner: TeamOwner;
  size?: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";

  if (failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-800 font-semibold text-white ${sizeClass}`}
        title={owner.name}
      >
        {initials(owner.name)}
      </span>
    );
  }

  return (
    <img
      src={owner.avatar}
      alt={owner.name}
      title={owner.name}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover ring-2 ring-white ${sizeClass}`}
    />
  );
}

export function OwnerList({
  owners,
  compact = false,
}: {
  owners: TeamOwner[];
  compact?: boolean;
}) {
  if (owners.length === 0) {
    return <span className="text-zinc-400">—</span>;
  }

  const avatarSize = compact ? "sm" : "md";
  const nameClass = compact
    ? "text-xs font-medium text-zinc-500"
    : "text-xs font-medium text-zinc-700";

  if (owners.length === 1) {
    const owner = owners[0];
    return (
      <div className="flex items-center gap-2">
        <Avatar owner={owner} size={avatarSize} />
        <span className={nameClass}>{owner.name}</span>
      </div>
    );
  }

  return (
    <div className="flex -space-x-2">
      {owners.map((owner, index) => (
        <span key={owner.name} className="relative" style={{ zIndex: index }}>
          <Avatar owner={owner} size={avatarSize} />
        </span>
      ))}
    </div>
  );
}
