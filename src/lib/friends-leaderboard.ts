import { participants } from "./teams";
import type { FriendLeaderboardEntry, FriendTeamEntry, LeaderboardEntry } from "./types";

export function buildFriendsLeaderboard(
  entries: LeaderboardEntry[],
): FriendLeaderboardEntry[] {
  const entryByTeam = new Map(entries.map((entry) => [entry.team, entry]));

  const friends = participants.map((participant) => {
    const teams: FriendTeamEntry[] = participant.teams.map((team) => {
      const entry = entryByTeam.get(team)!;

      return {
        team,
        iso: entry.iso,
        isEliminated: entry.isEliminated,
        isWinner: entry.isWinner,
        isRunnerUp: entry.isRunnerUp,
        roundSort: entry.roundSort,
        fifaRank: entry.fifaRank,
        statusShort: entry.statusShort,
        statusLong: entry.statusLong,
        groupStats: entry.groupStats,
      };
    });

    const stillIn = teams.filter((team) => !team.isEliminated);

    return {
      name: participant.name,
      avatar: participant.avatar,
      teams,
      hasWinner: teams.some((team) => team.isWinner),
      hasRunnerUp: teams.some((team) => team.isRunnerUp),
      activeCount: stillIn.length,
      bestRoundSort: Math.max(...teams.map((team) => team.roundSort), 0),
      totalPoints: stillIn.reduce((sum, team) => sum + team.groupStats.points, 0),
      totalWins: stillIn.reduce((sum, team) => sum + team.groupStats.won, 0),
      totalGoalDifference: stillIn.reduce(
        (sum, team) => sum + team.groupStats.goalDifference,
        0,
      ),
      bestFifaRank:
        stillIn.length > 0
          ? Math.min(...stillIn.map((team) => team.fifaRank))
          : 999,
    };
  });

  friends.sort(compareFriends);
  return friends;
}

function compareFriends(
  a: FriendLeaderboardEntry,
  b: FriendLeaderboardEntry,
): number {
  if (a.hasWinner !== b.hasWinner) return a.hasWinner ? -1 : 1;
  if (a.hasRunnerUp !== b.hasRunnerUp) return a.hasRunnerUp ? -1 : 1;

  if (a.activeCount !== b.activeCount) return b.activeCount - a.activeCount;
  if (a.bestRoundSort !== b.bestRoundSort) return b.bestRoundSort - a.bestRoundSort;
  if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
  if (a.totalWins !== b.totalWins) return b.totalWins - a.totalWins;
  if (a.totalGoalDifference !== b.totalGoalDifference) {
    return b.totalGoalDifference - a.totalGoalDifference;
  }

  if (a.bestFifaRank !== b.bestFifaRank) return a.bestFifaRank - b.bestFifaRank;

  return a.name.localeCompare(b.name);
}
