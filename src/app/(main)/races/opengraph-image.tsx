import { ImageResponse } from "next/og";
import { MAJOR_CODE, MAJORS_ORDER, getMajorsForYear } from "@/lib/majors";

export const alt = "World Marathon Majors Calendar 2026–2027 — Runners League";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const counts = { 2026: getMajorsForYear(2026).length, 2027: getMajorsForYear(2027).length };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1a1512",
          padding: "56px 64px",
          color: "#f3eae0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, transform: "skewX(-12deg)" }}>
            <div style={{ width: 14, height: 26, borderRadius: 3, background: "#8f7960" }} />
            <div style={{ width: 14, height: 40, borderRadius: 3, background: "#b49a76" }} />
            <div style={{ width: 14, height: 56, borderRadius: 3, background: "#c1440e" }} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Runners League
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 950 }}>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 600, lineHeight: 1.12, letterSpacing: -1 }}>
            The World Marathon Majors Calendar
          </div>
          <div style={{ display: "flex", fontSize: 21, color: "#b49a76" }}>
            {counts[2026]} races in 2026, {counts[2027]} in 2027 — dates, distances, and registration links.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {MAJORS_ORDER.map((m) => (
              <div
                key={m}
                style={{
                  display: "flex",
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  border: "2px dashed #4f4033",
                  background: "#251d16",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                  fontWeight: 600,
                }}
              >
                {MAJOR_CODE[m]}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #4f4033",
              paddingTop: 18,
              fontSize: 15,
            }}
          >
            <span style={{ color: "#6e5c48" }}>Updated as official dates are confirmed</span>
            <span style={{ fontWeight: 600 }}>runnersleague.org/races</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
