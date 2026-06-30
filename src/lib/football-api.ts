import type { OpenFootballData, OpenFootballMatch } from "./types";
import { apiNameToCanonical } from "./teams";
import { fetchWorldCup26Matches } from "./worldcup26-api";
import {
  getMockTournamentData,
  isMockTournamentEnabled,
} from "./mock-tournament";

const REVALIDATE_SECONDS = 3600;
const FETCH_TIMEOUT_MS = 5000;
const TOURNAMENT_CACHE_TAG = "tournament-data";

const OPEN_FOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const LIVE_MIRROR_URL =
  "https://raw.githubusercontent.com/upbound-web/worldcup-live.json/master/2026/worldcup.json";

const KNOCKOUT_ROUNDS = new Set([
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Match for third place",
  "Final",
]);

async function fetchJsonMatches(url: string): Promise<OpenFootballMatch[]> {
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [TOURNAMENT_CACHE_TAG] },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tournament data from ${url}: ${response.status}`);
  }

  const data = (await response.json()) as OpenFootballData;
  return data.matches;
}

function matchKey(match: OpenFootballMatch): string | null {
  const team1 = apiNameToCanonical(match.team1);
  const team2 = apiNameToCanonical(match.team2);

  if (!team1 || !team2 || !match.date) return null;

  const teams = [team1, team2].sort();
  return `${match.date}|${teams[0]}|${teams[1]}`;
}

function isKnockoutRound(round: string): boolean {
  return KNOCKOUT_ROUNDS.has(round);
}

function pickPreferredMatch(
  existing: OpenFootballMatch,
  incoming: OpenFootballMatch,
): OpenFootballMatch {
  const existingKnockout = isKnockoutRound(existing.round);
  const incomingKnockout = isKnockoutRound(incoming.round);

  if (existingKnockout && !incomingKnockout) return existing;
  if (incomingKnockout && !existingKnockout) return incoming;

  const existingHasPenalties = existing.score?.p !== undefined;
  const incomingHasPenalties = incoming.score?.p !== undefined;

  if (existingHasPenalties && !incomingHasPenalties) return existing;
  if (incomingHasPenalties && !existingHasPenalties) return incoming;

  return incoming;
}

function mergeMatches(...sources: OpenFootballMatch[][]): OpenFootballMatch[] {
  const merged = new Map<string, OpenFootballMatch>();

  for (const matches of sources) {
    for (const match of matches) {
      if (!match.score?.ft) continue;

      const key = matchKey(match);
      if (!key) continue;

      const existing = merged.get(key);
      merged.set(key, existing ? pickPreferredMatch(existing, match) : match);
    }
  }

  return [...merged.values()].sort((a, b) => {
    const dateCompare = (a.date ?? "").localeCompare(b.date ?? "");
    if (dateCompare !== 0) return dateCompare;
    return a.team1.localeCompare(b.team1);
  });
}

export async function fetchTournamentData(): Promise<
  OpenFootballData & { finishedMatches: number }
> {
  if (isMockTournamentEnabled()) {
    return getMockTournamentData();
  }

  const results = await Promise.allSettled([
    fetchWorldCup26Matches(),
    fetchJsonMatches(LIVE_MIRROR_URL),
    fetchJsonMatches(OPEN_FOOTBALL_URL),
  ]);

  const matchSources = results
    .filter((result): result is PromiseFulfilledResult<OpenFootballMatch[]> => {
      return result.status === "fulfilled";
    })
    .map((result) => result.value);

  if (matchSources.length === 0) {
    const reason = results[0]?.status === "rejected" ? results[0].reason : null;
    throw new Error(
      reason instanceof Error
        ? reason.message
        : "Failed to fetch tournament data from all sources",
    );
  }

  const matches = mergeMatches(...matchSources);

  return {
    name: "World Cup 2026",
    matches,
    finishedMatches: matches.length,
  };
}
