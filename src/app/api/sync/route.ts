import { NextResponse } from "next/server";

import { refreshTournamentData } from "@/lib/refresh-tournament-data";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await refreshTournamentData();

    return NextResponse.json({
      ok: true,
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
