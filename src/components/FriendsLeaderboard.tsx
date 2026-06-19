"use client";

import { useState } from "react";

import type { FriendLeaderboardEntry, FriendTeamEntry } from "@/lib/types";
import { getTeamShortName } from "@/lib/teams";

function TeamFlag({
  iso,
  team,
  faded,
}: {
  iso: string;
  team: string;
  faded: boolean;
}) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={`${team} flag`}
      title={team}
      width={28}
      height={20}
      className={`h-5 w-7 shrink-0 rounded-sm object-cover shadow-sm transition-opacity sm:h-6 sm:w-8 ${
        faded ? "opacity-25" : "opacity-100"
      }`}
      loading="lazy"
    />
  );
}

function ParticipantAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  return (
    <img
      src={avatar}
      alt={name}
      className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white sm:h-9 sm:w-9"
      loading="lazy"
    />
  );
}

function TeamFlags({ teams }: { teams: FriendTeamEntry[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {teams.map((team) => (
        <TeamFlag
          key={team.team}
          iso={team.iso}
          team={team.team}
          faded={team.isEliminated && !team.isRunnerUp}
        />
      ))}
    </div>
  );
}

function StatsSummary({ entry }: { entry: FriendLeaderboardEntry }) {
  if (entry.activeCount === 0) {
    return <span className="text-zinc-400">All out</span>;
  }

  const gd =
    entry.totalGoalDifference >= 0
      ? `+${entry.totalGoalDifference}`
      : `${entry.totalGoalDifference}`;

  return (
    <span className="tabular-nums text-zinc-700">
      {entry.totalPoints} pts · {entry.totalWins}W · GD {gd}
    </span>
  );
}

function TeamPerformance({ team }: { team: FriendTeamEntry }) {
  const { groupStats } = team;

  if (groupStats.played === 0) {
    return <span className="text-zinc-400">Not played yet</span>;
  }

  const gd =
    groupStats.goalDifference >= 0
      ? `+${groupStats.goalDifference}`
      : `${groupStats.goalDifference}`;

  return (
    <span className="text-right text-xs tabular-nums text-zinc-600 sm:text-sm">
      <span className="block sm:inline">
        {groupStats.points} pts · {groupStats.won}-{groupStats.drawn}-
        {groupStats.lost}
      </span>
      <span className="mx-1 hidden sm:inline">·</span>
      <span className="block sm:inline">GD {gd}</span>
      <span className="mx-1 hidden sm:inline">·</span>
      <span className="mt-0.5 block font-medium text-zinc-500 sm:mt-0 sm:inline">
        <span className="sm:hidden">{team.statusShort}</span>
        <span className="hidden sm:inline">{team.statusLong}</span>
      </span>
    </span>
  );
}

function ExpandedTeams({ teams }: { teams: FriendTeamEntry[] }) {
  return (
    <div className="space-y-2 pt-1">
      {teams.map((team) => {
        const faded = team.isEliminated && !team.isRunnerUp;

        return (
          <div
            key={team.team}
            className={`flex items-center gap-3 rounded-lg px-2 py-2 sm:px-3 ${
              faded ? "bg-zinc-100/80 text-zinc-400" : "bg-white text-zinc-900"
            }`}
          >
            <TeamFlag iso={team.iso} team={team.team} faded={faded} />
            <div className="min-w-0 flex-1">
              <div
                className={`truncate font-medium ${faded ? "text-zinc-500" : "text-zinc-900"}`}
              >
                <span className="sm:hidden">{getTeamShortName(team.team)}</span>
                <span className="hidden sm:inline">{team.team}</span>
              </div>
            </div>
            <TeamPerformance team={team} />
          </div>
        );
      })}
    </div>
  );
}

function FriendsRow({
  entry,
  rank,
  expanded,
  onToggle,
}: {
  entry: FriendLeaderboardEntry;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const allOut = entry.activeCount === 0 && !entry.hasRunnerUp && !entry.hasWinner;

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition-colors hover:bg-emerald-50/60 ${
          expanded
            ? allOut
              ? "border-b-0 bg-zinc-50/80 text-zinc-400"
              : "border-b-0 bg-white text-zinc-900"
            : allOut
              ? "border-b border-zinc-100 bg-zinc-50/80 text-zinc-400"
              : "border-b border-zinc-100 bg-white text-zinc-900"
        }`}
      >
        <td className="w-7 max-w-7 px-1 py-4 text-center text-xs font-medium tabular-nums sm:w-auto sm:max-w-none sm:px-4 sm:text-left sm:text-sm">
          {rank}
        </td>
        <td className="px-2 py-4 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ParticipantAvatar name={entry.name} avatar={entry.avatar} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`font-semibold ${allOut ? "text-zinc-500" : "text-zinc-900"}`}
                >
                  {entry.name}
                </div>
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="sm:hidden">
                <div className="mt-1.5">
                  <TeamFlags teams={entry.teams} />
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="hidden px-4 py-4 sm:table-cell">
          <TeamFlags teams={entry.teams} />
        </td>
        <td className="px-2 py-4 text-xs sm:px-4 sm:text-sm">
          <StatsSummary entry={entry} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-t-0 border-b border-zinc-100 bg-white">
          <td colSpan={4} className="px-3 pb-4 pt-0 sm:px-4">
            <ExpandedTeams teams={entry.teams} />
          </td>
        </tr>
      )}
    </>
  );
}

export function FriendsLeaderboardTable({
  entries,
}: {
  entries: FriendLeaderboardEntry[];
}) {
  const [expandedName, setExpandedName] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-900 text-left text-xs font-semibold uppercase tracking-wide text-zinc-300">
            <tr>
              <th className="w-7 max-w-7 px-1 py-3 text-center sm:w-auto sm:max-w-none sm:px-4 sm:text-left">
                #
              </th>
              <th className="px-2 py-3 sm:px-4">Friend</th>
              <th className="hidden px-4 py-3 sm:table-cell">Teams</th>
              <th className="px-2 py-3 sm:px-4">Total points</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <FriendsRow
                key={entry.name}
                entry={entry}
                rank={index + 1}
                expanded={expandedName === entry.name}
                onToggle={() =>
                  setExpandedName((current) =>
                    current === entry.name ? null : entry.name,
                  )
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
