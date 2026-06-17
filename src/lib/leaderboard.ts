import { fetchTournamentData } from "./football-api";
import { computeTeamStates, ROUND_SORT } from "./tournament";
import {
  getAllAssignedTeams,
  getFifaRank,
  getIsoCode,
  ownersMap,
} from "./teams";
import type { LeaderboardData, LeaderboardEntry } from "./types";

export async function getLeaderboard(): Promise<LeaderboardData> {
  const tournament = await fetchTournamentData();
  const teamStates = computeTeamStates(tournament.matches);

  const entries: LeaderboardEntry[] = getAllAssignedTeams().map((team) => {
    const state = teamStates.get(team)!;
    const owners = ownersMap.get(team) ?? [];

    return {
      team,
      owners,
      iso: getIsoCode(team),
      fifaRank: getFifaRank(team),
      statusShort: state.statusShort,
      statusLong: state.statusLong,
      isEliminated: state.isEliminated,
      round: state.round,
      roundSort: state.roundSort,
      groupStats: state.groupStats,
      isWinner: state.isWinner,
      isRunnerUp: state.isRunnerUp,
    };
  });

  entries.sort(compareEntries);

  return {
    entries,
    lastUpdated: new Date().toISOString(),
    tournamentName: tournament.name,
    finishedMatches: tournament.finishedMatches,
  };
}

function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (a.isEliminated !== b.isEliminated) {
    return a.isEliminated ? 1 : -1;
  }

  if (!a.isEliminated && !b.isEliminated) {
    if (b.roundSort !== a.roundSort) return b.roundSort - a.roundSort;

    const aHasPlayed = a.groupStats.played > 0;
    const bHasPlayed = b.groupStats.played > 0;
    if (aHasPlayed !== bHasPlayed) {
      return aHasPlayed ? -1 : 1;
    }

    if (a.groupStats.points !== b.groupStats.points) {
      return b.groupStats.points - a.groupStats.points;
    }

    if (a.groupStats.goalDifference !== b.groupStats.goalDifference) {
      return b.groupStats.goalDifference - a.groupStats.goalDifference;
    }

    if (a.groupStats.goalsFor !== b.groupStats.goalsFor) {
      return b.groupStats.goalsFor - a.groupStats.goalsFor;
    }

    return a.fifaRank - b.fifaRank;
  }

  if (b.roundSort !== a.roundSort) return b.roundSort - a.roundSort;

  const aElimRound = a.roundSort || ROUND_SORT[a.round] || 0;
  const bElimRound = b.roundSort || ROUND_SORT[b.round] || 0;
  if (bElimRound !== aElimRound) return bElimRound - aElimRound;

  return a.fifaRank - b.fifaRank;
}

export function formatLastUpdated(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
