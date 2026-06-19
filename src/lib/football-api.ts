import type { OpenFootballData, OpenFootballMatch } from "./types";
import { apiNameToCanonical } from "./teams";
import { fetchWorldCup26Matches } from "./worldcup26-api";
import {
  getMockTournamentData,
  isMockTournamentEnabled,
} from "./mock-tournament";

const REVALIDATE_SECONDS = 3600;
const FETCH_TIMEOUT_MS = 5000;

const OPEN_FOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const LIVE_MIRROR_URL =
  "https://raw.githubusercontent.com/upbound-web/worldcup-live.json/master/2026/worldcup.json";

async function fetchJsonMatches(url: string): Promise<OpenFootballMatch[]> {
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
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

function mergeMatches(...sources: OpenFootballMatch[][]): OpenFootballMatch[] {
  const merged = new Map<string, OpenFootballMatch>();

  for (const matches of sources) {
    for (const match of matches) {
      if (!match.score?.ft) continue;

      const key = matchKey(match);
      if (!key) continue;

      merged.set(key, match);
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
    fetchJsonMatches(OPEN_FOOTBALL_URL),
    fetchJsonMatches(LIVE_MIRROR_URL),
    fetchWorldCup26Matches(),
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
