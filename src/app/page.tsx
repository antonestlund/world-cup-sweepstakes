import { FriendsLeaderboardTable } from "@/components/FriendsLeaderboard";
import { LeaderboardTable } from "@/components/Leaderboard";
import { UpdateDataButton } from "@/components/UpdateDataButton";
import { ViewTabs } from "@/components/ViewTabs";
import { buildFriendsLeaderboard } from "@/lib/friends-leaderboard";
import { formatLastUpdated, getLeaderboard } from "@/lib/leaderboard";
import { isMockTournamentEnabled } from "@/lib/mock-tournament";

export const revalidate = 3600;

export default async function Home() {
  const { entries, lastUpdated } = await getLeaderboard();
  const friends = buildFriendsLeaderboard(entries);

  const active = entries.filter(
    (entry) => !entry.isEliminated || entry.isRunnerUp,
  );
  const eliminated = entries.filter(
    (entry) => entry.isEliminated && !entry.isRunnerUp,
  );

  const stillIn = active.filter((entry) => !entry.isRunnerUp).length;
  const usingMockData = isMockTournamentEnabled();

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-950 via-emerald-900 to-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {usingMockData && (
          <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-100">
            Mock tournament data active — Round of 16 complete. Remove{" "}
            <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">
              USE_MOCK_TOURNAMENT
            </code>{" "}
            from <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
            to restore live results.
          </div>
        )}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            World Cup Sweepstake
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-emerald-200/70">
            <span className="rounded-full bg-white/10 px-3 py-1">
              {stillIn} teams still in
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Last updated {formatLastUpdated(lastUpdated)}
            </span>
          </div>
        </header>

        <ViewTabs
          countries={
            <>
              <LeaderboardTable active={active} eliminated={eliminated} />

              <p className="mt-6 text-center text-xs text-emerald-200/50 sm:text-left">
                Match data from Open Football + worldcup26.ir (merged). FIFA
                rankings are pre-tournament. Results can lag real games by a few
                hours.
              </p>
            </>
          }
          friends={
            <>
              <FriendsLeaderboardTable entries={friends} />

              <p className="mt-6 text-center text-xs text-emerald-200/50 sm:text-left">
                Ranked by teams still in the tournament, then points, wins, and
                goal difference from active picks.
              </p>
            </>
          }
        />
        <UpdateDataButton />
      </div>
    </div>
  );
}
