import type { LeaderboardEntry } from "@/lib/types";
import { OwnerList } from "@/components/OwnerAvatar";
import { getTeamShortName } from "@/lib/teams";

function TeamFlag({ iso, team }: { iso: string; team: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={`${team} flag`}
      width={28}
      height={20}
      className="h-3.5 w-5 shrink-0 rounded-sm object-cover shadow-sm sm:h-5 sm:w-7"
      loading="lazy"
    />
  );
}

function StatusLabel({
  short,
  long,
}: {
  short: string;
  long: string;
}) {
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{long}</span>
    </>
  );
}

function StatusBadge({ entry }: { entry: LeaderboardEntry }) {
  if (entry.isWinner) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
        Champions
      </span>
    );
  }

  if (entry.isRunnerUp) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
        Runners-up
      </span>
    );
  }

  if (entry.isEliminated) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
        <StatusLabel short={entry.statusShort} long={entry.statusLong} />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
      <StatusLabel short={entry.statusShort} long={entry.statusLong} />
    </span>
  );
}

function StatsCell({ entry }: { entry: LeaderboardEntry }) {
  const { groupStats } = entry;

  if (groupStats.played === 0) {
    return <span className="text-zinc-400">Not played yet</span>;
  }

  return (
    <span className="tabular-nums text-zinc-700">
      {groupStats.won} - {groupStats.drawn} - {groupStats.lost} · GD{" "}
      {groupStats.goalDifference >= 0 ? "+" : ""}
      {groupStats.goalDifference}
    </span>
  );
}

function MobileStats({ entry }: { entry: LeaderboardEntry }) {
  const { groupStats } = entry;

  if (groupStats.played === 0) {
    return <div className="mt-0.5 text-xs text-zinc-400">Not played yet</div>;
  }

  return (
    <div className="mt-0.5 text-xs tabular-nums text-zinc-500">
      <div>
        {groupStats.points} pts · {groupStats.won}-{groupStats.drawn}-
        {groupStats.lost}
      </div>
      <div>
        GD {groupStats.goalDifference >= 0 ? "+" : ""}
        {groupStats.goalDifference}
      </div>
    </div>
  );
}

export function LeaderboardRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const eliminated = entry.isEliminated && !entry.isRunnerUp;

  return (
    <tr
      className={
        eliminated
          ? "border-b border-zinc-100 bg-zinc-50/80 text-zinc-400"
          : "border-b border-zinc-100 bg-white text-zinc-900"
      }
    >
      <td className="w-7 max-w-7 px-1 py-4 text-center text-xs font-medium tabular-nums sm:w-auto sm:max-w-none sm:px-4 sm:text-left sm:text-sm">
        {rank}
      </td>
      <td className="px-2 py-4 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <TeamFlag iso={entry.iso} team={entry.team} />
          <div>
            <div
              className={`font-semibold ${eliminated ? "text-zinc-500" : "text-zinc-900"}`}
            >
              <span className="sm:hidden">{getTeamShortName(entry.team)}</span>
              <span className="hidden sm:inline">{entry.team}</span>
            </div>
            <div className="sm:hidden">
              <MobileStats entry={entry} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 py-4 text-sm sm:px-4">
        <span className="sm:hidden">
          <OwnerList owners={entry.owners} compact />
        </span>
        <span className="hidden sm:block">
          <OwnerList owners={entry.owners} />
        </span>
      </td>
      <td className="hidden px-4 py-4 text-sm tabular-nums sm:table-cell">
        {entry.groupStats.played > 0 ? (
          <span className="font-semibold text-zinc-900">
            {entry.groupStats.points}
          </span>
        ) : (
          <span className="text-zinc-400">—</span>
        )}
      </td>
      <td className="hidden px-4 py-4 text-sm md:table-cell">
        <StatsCell entry={entry} />
      </td>
      <td className="hidden px-4 py-4 text-sm tabular-nums md:table-cell">
        #{entry.fifaRank}
      </td>
      <td className="px-3 py-4 sm:px-4">
        <StatusBadge entry={entry} />
      </td>
    </tr>
  );
}

export function LeaderboardTable({
  active,
  eliminated,
}: {
  active: LeaderboardEntry[];
  eliminated: LeaderboardEntry[];
}) {
  let rank = 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-900 text-left text-xs font-semibold uppercase tracking-wide text-zinc-300">
            <tr>
              <th className="w-7 max-w-7 px-1 py-3 text-center sm:w-auto sm:max-w-none sm:px-4 sm:text-left">
                #
              </th>
              <th className="px-2 py-3 sm:px-4">Team</th>
              <th className="px-2 py-3 sm:px-4">Owner</th>
              <th className="hidden px-4 py-3 sm:table-cell">Pts</th>
              <th className="hidden px-4 py-3 md:table-cell">W - D - L · GD</th>
              <th className="hidden px-4 py-3 md:table-cell">FIFA</th>
              <th className="px-3 py-3 sm:px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {active.map((entry) => {
              rank += 1;
              return (
                <LeaderboardRow key={entry.team} entry={entry} rank={rank} />
              );
            })}
            {eliminated.length > 0 && (
              <tr className="bg-zinc-100">
                <td
                  colSpan={7}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500"
                >
                  Eliminated
                </td>
              </tr>
            )}
            {eliminated.map((entry) => {
              rank += 1;
              return (
                <LeaderboardRow key={entry.team} entry={entry} rank={rank} />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
