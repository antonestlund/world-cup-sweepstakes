"use server";

import { refreshTournamentData } from "@/lib/refresh-tournament-data";

export async function refreshDataAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    await refreshTournamentData();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to refresh data",
    };
  }
}
