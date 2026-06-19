import type { OpenFootballData, OpenFootballMatch } from "./types";

/**
 * Mock tournament snapshot: group stage complete, Round of 32 complete,
 * Round of 16 complete (8 teams in quarter-finals).
 *
 * Enable with USE_MOCK_TOURNAMENT=true in .env.local
 * Disable (or delete the var) to return to live data.
 */

type GroupRanking = [string, string, string, string];

const MOCK_GROUP_RANKINGS: Record<string, GroupRanking> = {
  "Group A": ["Spain", "Morocco", "Austria", "Uzbekistan"],
  "Group B": ["Portugal", "Norway", "Scotland", "Cape Verde"],
  "Group C": ["Belgium", "Switzerland", "Ghana", "Jordan"],
  "Group D": ["France", "Algeria", "Curaçao", "Iraq"],
  "Group E": ["Germany", "Australia", "Ivory Coast", "Haiti"],
  "Group F": ["Brazil", "Czech Republic", "New Zealand", "South Korea"],
  "Group G": ["Croatia", "Turkey", "Egypt", "Bosnia and Herzegovina"],
  "Group H": ["Argentina", "Japan", "Colombia", "Panama"],
  "Group I": ["England", "Canada", "Senegal", "Mexico"],
  "Group J": ["United States", "Uruguay", "Ecuador", "Qatar"],
  "Group K": ["Netherlands", "Iran", "Sweden", "Saudi Arabia"],
  "Group L": ["Paraguay", "DR Congo", "Tunisia", "South Africa"],
};

function buildGroupMatches(
  group: string,
  ranking: GroupRanking,
  dayOffset: number,
): OpenFootballMatch[] {
  const [first, second, third, fourth] = ranking;
  const date = (matchday: number) =>
    `2026-06-${String(14 + dayOffset + matchday).padStart(2, "0")}`;

  return [
    {
      round: "Matchday 1",
      date: date(1),
      group,
      team1: first,
      team2: second,
      score: { ft: [2, 0] },
    },
    {
      round: "Matchday 1",
      date: date(1),
      group,
      team1: third,
      team2: fourth,
      score: { ft: [1, 0] },
    },
    {
      round: "Matchday 2",
      date: date(2),
      group,
      team1: first,
      team2: third,
      score: { ft: [1, 0] },
    },
    {
      round: "Matchday 2",
      date: date(2),
      group,
      team1: second,
      team2: fourth,
      score: { ft: [2, 0] },
    },
    {
      round: "Matchday 3",
      date: date(3),
      group,
      team1: first,
      team2: fourth,
      score: { ft: [1, 0] },
    },
    {
      round: "Matchday 3",
      date: date(3),
      group,
      team1: second,
      team2: third,
      score: { ft: [2, 1] },
    },
  ];
}

const KNOCKOUT_MATCHES: OpenFootballMatch[] = [
  // Round of 32
  {
    round: "Round of 32",
    date: "2026-07-02",
    team1: "Spain",
    team2: "Norway",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-02",
    team1: "Portugal",
    team2: "Croatia",
    score: { ft: [1, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-03",
    team1: "France",
    team2: "Morocco",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-03",
    team1: "Germany",
    team2: "Colombia",
    score: { ft: [0, 2] },
  },
  {
    round: "Round of 32",
    date: "2026-07-04",
    team1: "Brazil",
    team2: "New Zealand",
    score: { ft: [3, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-04",
    team1: "Argentina",
    team2: "Egypt",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-05",
    team1: "England",
    team2: "Japan",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-05",
    team1: "United States",
    team2: "Algeria",
    score: { ft: [2, 1] },
  },
  {
    round: "Round of 32",
    date: "2026-07-06",
    team1: "Netherlands",
    team2: "Paraguay",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-06",
    team1: "Belgium",
    team2: "Turkey",
    score: { ft: [0, 1] },
  },
  {
    round: "Round of 32",
    date: "2026-07-07",
    team1: "Czech Republic",
    team2: "Iran",
    score: { ft: [1, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-07",
    team1: "Canada",
    team2: "Ghana",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-08",
    team1: "Switzerland",
    team2: "Sweden",
    score: { ft: [1, 2] },
  },
  {
    round: "Round of 32",
    date: "2026-07-08",
    team1: "Australia",
    team2: "Ecuador",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-09",
    team1: "Ivory Coast",
    team2: "Scotland",
    score: { ft: [1, 0] },
  },
  {
    round: "Round of 32",
    date: "2026-07-09",
    team1: "Austria",
    team2: "DR Congo",
    score: { ft: [1, 2] },
  },

  // Round of 16
  {
    round: "Round of 16",
    date: "2026-07-12",
    team1: "Spain",
    team2: "Portugal",
    score: { ft: [2, 1] },
  },
  {
    round: "Round of 16",
    date: "2026-07-12",
    team1: "France",
    team2: "Colombia",
    score: { ft: [1, 0] },
  },
  {
    round: "Round of 16",
    date: "2026-07-13",
    team1: "Brazil",
    team2: "Argentina",
    score: { ft: [1, 2] },
  },
  {
    round: "Round of 16",
    date: "2026-07-13",
    team1: "England",
    team2: "United States",
    score: { ft: [3, 1] },
  },
  {
    round: "Round of 16",
    date: "2026-07-14",
    team1: "Netherlands",
    team2: "Belgium",
    score: { ft: [2, 0] },
  },
  {
    round: "Round of 16",
    date: "2026-07-14",
    team1: "Czech Republic",
    team2: "Canada",
    score: { ft: [1, 2] },
  },
  {
    round: "Round of 16",
    date: "2026-07-15",
    team1: "Sweden",
    team2: "Australia",
    score: { ft: [1, 0] },
  },
  {
    round: "Round of 16",
    date: "2026-07-15",
    team1: "Ivory Coast",
    team2: "DR Congo",
    score: { ft: [2, 1] },
  },
];

function buildGroupStageMatches(): OpenFootballMatch[] {
  return Object.entries(MOCK_GROUP_RANKINGS).flatMap(
    ([group, ranking], index) => buildGroupMatches(group, ranking, index * 3),
  );
}

export function isMockTournamentEnabled(): boolean {
  return process.env.USE_MOCK_TOURNAMENT === "true";
}

export function getMockTournamentData(): OpenFootballData & {
  finishedMatches: number;
} {
  const matches = [...buildGroupStageMatches(), ...KNOCKOUT_MATCHES];

  return {
    name: "World Cup 2026 (Mock — Round of 16 complete)",
    matches,
    finishedMatches: matches.length,
  };
}
