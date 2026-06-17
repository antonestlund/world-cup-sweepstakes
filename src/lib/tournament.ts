import { apiNameToCanonical, getAllAssignedTeams } from "./teams";
import type {
  GroupStats,
  OpenFootballMatch,
  TournamentRound,
} from "./types";

const GROUP_MATCH_PREFIX = "Matchday";

interface GroupTableEntry extends GroupStats {
  team: string;
}

interface TeamTournamentState {
  round: TournamentRound;
  roundSort: number;
  isEliminated: boolean;
  statusShort: string;
  statusLong: string;
  isWinner: boolean;
  isRunnerUp: boolean;
  groupStats: GroupStats;
}

const ROUND_SORT: Record<TournamentRound, number> = {
  winner: 100,
  "runner-up": 95,
  final: 90,
  "semi-final": 80,
  "quarter-final": 70,
  "round-of-16": 60,
  "round-of-32": 50,
  group: 40,
  "third-place": 35,
};

function emptyGroupStats(group: string | null = null): GroupStats {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    groupPosition: null,
    group,
  };
}

function isRealTeam(name: string): boolean {
  if (name.includes("/")) return false;
  if (/^\d/.test(name)) return false;
  if (/^[WL]\d+$/.test(name)) return false;
  return true;
}

function normalizeTeam(name: string): string | null {
  if (!isRealTeam(name)) return null;
  return apiNameToCanonical(name) ?? name;
}

function isGroupMatch(match: OpenFootballMatch): boolean {
  return match.round.startsWith(GROUP_MATCH_PREFIX) && Boolean(match.group);
}

function computeGroupTables(
  matches: OpenFootballMatch[],
): Map<string, GroupTableEntry[]> {
  const tables = new Map<string, Map<string, GroupTableEntry>>();

  for (const match of matches.filter(isGroupMatch)) {
    if (!match.group || !match.score?.ft) continue;

    const group = match.group;
    if (!tables.has(group)) tables.set(group, new Map());

    const table = tables.get(group)!;
    const [score1, score2] = match.score.ft;

    for (const apiName of [match.team1, match.team2]) {
      const canonical = normalizeTeam(apiName);
      if (!canonical) continue;

      if (!table.has(canonical)) {
        table.set(canonical, { team: canonical, ...emptyGroupStats(group) });
      }
    }

    const team1 = normalizeTeam(match.team1);
    const team2 = normalizeTeam(match.team2);
    if (!team1 || !team2) continue;

    const entry1 = table.get(team1)!;
    const entry2 = table.get(team2)!;

    entry1.played += 1;
    entry2.played += 1;
    entry1.goalsFor += score1;
    entry1.goalsAgainst += score2;
    entry2.goalsFor += score2;
    entry2.goalsAgainst += score1;

    if (score1 > score2) {
      entry1.won += 1;
      entry1.points += 3;
      entry2.lost += 1;
    } else if (score2 > score1) {
      entry2.won += 1;
      entry2.points += 3;
      entry1.lost += 1;
    } else {
      entry1.drawn += 1;
      entry2.drawn += 1;
      entry1.points += 1;
      entry2.points += 1;
    }

    entry1.goalDifference = entry1.goalsFor - entry1.goalsAgainst;
    entry2.goalDifference = entry2.goalsFor - entry2.goalsAgainst;
  }

  const ranked = new Map<string, GroupTableEntry[]>();

  for (const [group, table] of tables) {
    const entries = [...table.values()].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.goalsFor - a.goalsFor;
    });

    entries.forEach((entry, index) => {
      entry.groupPosition = index + 1;
    });

    ranked.set(group, entries);
  }

  return ranked;
}

function pickBestThirdPlaceTeams(
  groupTables: Map<string, GroupTableEntry[]>,
): Set<string> {
  const thirdPlace: GroupTableEntry[] = [];

  for (const entries of groupTables.values()) {
    if (entries.length < 3) continue;
    const third = entries[2];
    if (third && third.played >= 3) {
      thirdPlace.push(third);
    }
  }

  thirdPlace.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  });

  return new Set(thirdPlace.slice(0, 8).map((entry) => entry.team));
}

function allGroupMatchesComplete(
  matches: OpenFootballMatch[],
  groupTables: Map<string, GroupTableEntry[]>,
): boolean {
  const groupMatches = matches.filter(isGroupMatch);
  const finished = groupMatches.filter((m) => m.score?.ft).length;
  if (groupMatches.length === 0) return false;
  if (finished < groupMatches.length) return false;

  for (const entries of groupTables.values()) {
    if (entries.some((entry) => entry.played < 3)) return false;
  }

  return true;
}

function getQualifiedTeams(
  groupTables: Map<string, GroupTableEntry[]>,
  matches: OpenFootballMatch[],
): Set<string> | null {
  if (!allGroupMatchesComplete(matches, groupTables)) return null;

  const qualified = new Set<string>();
  const bestThird = pickBestThirdPlaceTeams(groupTables);

  for (const entries of groupTables.values()) {
    if (entries[0]) qualified.add(entries[0].team);
    if (entries[1]) qualified.add(entries[1].team);
  }

  for (const team of bestThird) {
    qualified.add(team);
  }

  return qualified;
}

function knockoutRoundName(round: string): TournamentRound | null {
  switch (round) {
    case "Round of 32":
      return "round-of-32";
    case "Round of 16":
      return "round-of-16";
    case "Quarter-final":
      return "quarter-final";
    case "Semi-final":
      return "semi-final";
    case "Match for third place":
      return "third-place";
    case "Final":
      return "final";
    default:
      return null;
  }
}

function formatRoundLabelShort(round: TournamentRound): string {
  switch (round) {
    case "winner":
      return "Champions";
    case "runner-up":
      return "Runners-up";
    case "final":
      return "Final";
    case "semi-final":
      return "Semis";
    case "quarter-final":
      return "Quarters";
    case "round-of-16":
      return "Last 16";
    case "round-of-32":
      return "Last 32";
    case "third-place":
      return "3rd place";
    case "group":
      return "Groups";
  }
}

function formatRoundLabelLong(round: TournamentRound): string {
  switch (round) {
    case "winner":
      return "Champions";
    case "runner-up":
      return "Runners-up";
    case "final":
      return "In Final";
    case "semi-final":
      return "Semi-finals";
    case "quarter-final":
      return "Quarter-finals";
    case "round-of-16":
      return "Round of 16";
    case "round-of-32":
      return "Round of 32";
    case "third-place":
      return "3rd place match";
    case "group":
      return "Group stage";
  }
}

function formatEliminatedLabelShort(round: TournamentRound): string {
  switch (round) {
    case "group":
      return "Out (Groups)";
    case "round-of-32":
      return "Out (Last 32)";
    case "round-of-16":
      return "Out (Last 16)";
    case "quarter-final":
      return "Out (Quarters)";
    case "semi-final":
      return "Out (Semis)";
    case "final":
      return "Out (Final)";
    case "third-place":
      return "Out (3rd place)";
    case "runner-up":
      return "Runners-up";
    case "winner":
      return "Champions";
  }
}

function formatEliminatedLabelLong(round: TournamentRound): string {
  switch (round) {
    case "group":
      return "Out (group stage)";
    case "round-of-32":
      return "Out (Round of 32)";
    case "round-of-16":
      return "Out (Round of 16)";
    case "quarter-final":
      return "Out (Quarter-finals)";
    case "semi-final":
      return "Out (Semi-finals)";
    case "final":
      return "Out (Final)";
    case "third-place":
      return "Out (3rd place)";
    case "runner-up":
      return "Runners-up";
    case "winner":
      return "Champions";
  }
}

function formatStatuses(
  round: TournamentRound,
  eliminated: boolean,
): { statusShort: string; statusLong: string } {
  return eliminated
    ? {
        statusShort: formatEliminatedLabelShort(round),
        statusLong: formatEliminatedLabelLong(round),
      }
    : {
        statusShort: formatRoundLabelShort(round),
        statusLong: formatRoundLabelLong(round),
      };
}

function roundAfterWinning(round: TournamentRound): TournamentRound {
  switch (round) {
    case "round-of-32":
      return "round-of-16";
    case "round-of-16":
      return "quarter-final";
    case "quarter-final":
      return "semi-final";
    case "semi-final":
      return "final";
    default:
      return round;
  }
}

export function computeTeamStates(
  matches: OpenFootballMatch[],
): Map<string, TeamTournamentState> {
  const assignedTeams = getAllAssignedTeams();
  const groupTables = computeGroupTables(matches);
  const qualified = getQualifiedTeams(groupTables, matches);

  const groupStatsMap = new Map<string, GroupStats>();
  for (const entries of groupTables.values()) {
    for (const entry of entries) {
      groupStatsMap.set(entry.team, {
        played: entry.played,
        won: entry.won,
        drawn: entry.drawn,
        lost: entry.lost,
        goalsFor: entry.goalsFor,
        goalsAgainst: entry.goalsAgainst,
        goalDifference: entry.goalDifference,
        points: entry.points,
        groupPosition: entry.groupPosition,
        group: entry.group,
      });
    }
  }

  const states = new Map<string, TeamTournamentState>();

  for (const team of assignedTeams) {
    const groupStats = groupStatsMap.get(team) ?? emptyGroupStats();
    const isGroupEliminated =
      qualified !== null && !qualified.has(team) ? true : false;

    const groupStatuses = formatStatuses("group", isGroupEliminated);

    states.set(team, {
      round: isGroupEliminated ? "group" : "group",
      roundSort: isGroupEliminated ? 0 : ROUND_SORT.group,
      isEliminated: isGroupEliminated,
      statusShort: groupStatuses.statusShort,
      statusLong: groupStatuses.statusLong,
      isWinner: false,
      isRunnerUp: false,
      groupStats,
    });
  }

  const knockoutMatches = matches
    .filter((m) => knockoutRoundName(m.round))
    .sort((a, b) => {
      const order = [
        "Round of 32",
        "Round of 16",
        "Quarter-final",
        "Semi-final",
        "Match for third place",
        "Final",
      ];
      return order.indexOf(a.round) - order.indexOf(b.round);
    });

  for (const match of knockoutMatches) {
    if (!match.score?.ft) continue;

    const round = knockoutRoundName(match.round);
    if (!round) continue;

    const team1 = normalizeTeam(match.team1);
    const team2 = normalizeTeam(match.team2);
    if (!team1 || !team2) continue;

    const [score1, score2] = match.score.ft;
    const winner = score1 > score2 ? team1 : team2;
    const loser = score1 > score2 ? team2 : team1;

    if (round === "final") {
      const winnerStatuses = formatStatuses("winner", false);
      const runnerUpStatuses = formatStatuses("runner-up", true);
      updateActive(winner, {
        round: "winner",
        roundSort: ROUND_SORT.winner,
        isEliminated: false,
        statusShort: winnerStatuses.statusShort,
        statusLong: winnerStatuses.statusLong,
        isWinner: true,
        isRunnerUp: false,
      });
      updateActive(loser, {
        round: "runner-up",
        roundSort: ROUND_SORT["runner-up"],
        isEliminated: true,
        statusShort: runnerUpStatuses.statusShort,
        statusLong: runnerUpStatuses.statusLong,
        isWinner: false,
        isRunnerUp: true,
      });
      continue;
    }

    if (round === "third-place") {
      const winnerStatuses = formatStatuses("third-place", false);
      const loserStatuses = formatStatuses("third-place", true);
      updateActive(winner, {
        round: "third-place",
        roundSort: ROUND_SORT["third-place"],
        isEliminated: false,
        statusShort: winnerStatuses.statusShort,
        statusLong: winnerStatuses.statusLong,
        isWinner: false,
        isRunnerUp: false,
      });
      updateActive(loser, {
        round: "third-place",
        roundSort: 0,
        isEliminated: true,
        statusShort: loserStatuses.statusShort,
        statusLong: loserStatuses.statusLong,
        isWinner: false,
        isRunnerUp: false,
      });
      continue;
    }

    const nextRound = roundAfterWinning(round);
    const winnerStatuses = formatStatuses(nextRound, false);
    const loserStatuses = formatStatuses(round, true);
    updateActive(winner, {
      round: nextRound,
      roundSort: ROUND_SORT[nextRound],
      isEliminated: false,
      statusShort: winnerStatuses.statusShort,
      statusLong: winnerStatuses.statusLong,
      isWinner: false,
      isRunnerUp: false,
    });

    updateActive(loser, {
      round,
      roundSort: 0,
      isEliminated: true,
      statusShort: loserStatuses.statusShort,
      statusLong: loserStatuses.statusLong,
      isWinner: false,
      isRunnerUp: false,
    });
  }

  function updateActive(
    team: string,
    patch: Partial<TeamTournamentState>,
  ): void {
    if (!states.has(team)) return;

    const current = states.get(team)!;
    states.set(team, {
      ...current,
      ...patch,
      groupStats: current.groupStats,
    });
  }

  return states;
}

export { ROUND_SORT, formatRoundLabelLong as formatRoundLabel };
