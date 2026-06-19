import { ImageResponse } from "next/og";

export const alt = "World Cup Sweepstake Leaderboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const rows = [
  {
    rank: 1,
    team: "Spain",
    flag: "es",
    owner: "Grace",
    pts: "7",
    status: "Group stage",
    statusBg: "#d1fae5",
    statusColor: "#065f46",
    muted: false,
  },
  {
    rank: 2,
    team: "Brazil",
    flag: "br",
    owner: "Jade",
    pts: "6",
    status: "Group stage",
    statusBg: "#d1fae5",
    statusColor: "#065f46",
    muted: false,
  },
  {
    rank: 3,
    team: "France",
    flag: "fr",
    owner: "Liam",
    pts: "6",
    status: "Group stage",
    statusBg: "#d1fae5",
    statusColor: "#065f46",
    muted: false,
  },
  {
    rank: 4,
    team: "England",
    flag: "gb-eng",
    owner: "Angie",
    pts: "4",
    status: "Group stage",
    statusBg: "#d1fae5",
    statusColor: "#065f46",
    muted: false,
  },
  {
    rank: 5,
    team: "Germany",
    flag: "de",
    owner: "Jeroen",
    pts: "3",
    status: "Group stage",
    statusBg: "#d1fae5",
    statusColor: "#065f46",
    muted: false,
  },
  {
    rank: 6,
    team: "Mexico",
    flag: "mx",
    owner: "Anton",
    pts: "—",
    status: "Not played yet",
    statusBg: "#e4e4e7",
    statusColor: "#52525b",
    muted: true,
  },
];

async function loadFlag(iso: string) {
  const response = await fetch(`https://flagcdn.com/w80/${iso}.png`);
  if (!response.ok) return null;
  return response.arrayBuffer();
}

export default async function Image() {
  const flags = await Promise.all(rows.map((row) => loadFlag(row.flag)));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, #064e3b 0%, #065f46 45%, #18181b 100%)",
          padding: "48px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            World Cup Sweepstake
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "rgba(209, 250, 229, 0.75)",
              marginTop: 8,
            }}
          >
            Live leaderboard · FIFA World Cup 2026
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid #e4e4e7",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#18181b",
              color: "#d4d4d8",
              fontSize: 16,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "14px 20px",
            }}
          >
            <div style={{ display: "flex", width: 48 }}>#</div>
            <div style={{ display: "flex", flex: 1 }}>Team</div>
            <div style={{ display: "flex", width: 140 }}>Owner</div>
            <div style={{ display: "flex", width: 64, justifyContent: "flex-end" }}>
              Pts
            </div>
            <div
              style={{
                display: "flex",
                width: 180,
                justifyContent: "flex-end",
              }}
            >
              Status
            </div>
          </div>

          {rows.map((row, index) => (
            <div
              key={row.team}
              style={{
                display: "flex",
                alignItems: "center",
                background: row.muted ? "rgba(250, 250, 250, 0.92)" : "#ffffff",
                color: row.muted ? "#a1a1aa" : "#18181b",
                fontSize: 22,
                padding: "16px 20px",
                borderTop: index === 0 ? "none" : "1px solid #f4f4f5",
              }}
            >
              <div style={{ display: "flex", width: 48, fontWeight: 500 }}>
                {row.rank}
              </div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  gap: 12,
                  fontWeight: 600,
                }}
              >
                {flags[index] ? (
                  <img
                    // ImageResponse accepts fetched ArrayBuffer at runtime
                    src={flags[index] as unknown as string}
                    width={36}
                    height={24}
                    style={{ borderRadius: 3, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: 36,
                      height: 24,
                      background: "#e4e4e7",
                      borderRadius: 3,
                    }}
                  />
                )}
                <div style={{ display: "flex" }}>{row.team}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  width: 140,
                  fontSize: 18,
                  color: row.muted ? "#a1a1aa" : "#52525b",
                }}
              >
                {row.owner}
              </div>
              <div
                style={{
                  display: "flex",
                  width: 64,
                  justifyContent: "flex-end",
                  fontWeight: 600,
                }}
              >
                {row.pts}
              </div>
              <div
                style={{
                  display: "flex",
                  width: 180,
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    background: row.statusBg,
                    color: row.statusColor,
                    fontSize: 15,
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: 999,
                  }}
                >
                  {row.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
