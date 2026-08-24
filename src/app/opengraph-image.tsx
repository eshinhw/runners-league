import { ImageResponse } from "next/og";
import { MAJOR_CODE, MAJORS_ORDER } from "@/lib/majors";

export const alt = "Runners League — Chase the World Marathon Majors, together.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
          <span style={{ fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: "#b49a76" }}>
            World Marathon Majors
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 600, lineHeight: 1.12, letterSpacing: -1 }}>
            Chase the World Marathon Majors, together.
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#b49a76" }}>
            Log every finish, follow the calendar, and see how you stack up.
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
            <span style={{ color: "#6e5c48" }}>{MAJORS_ORDER.length} Majors · 2026–2027 calendar tracked</span>
            <span style={{ fontWeight: 600 }}>runnersleague.org</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
