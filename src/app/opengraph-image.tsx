import { ImageResponse } from "next/og";

export const alt = "RiggerIQ — Calculadora de ingeniería de izaje";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#18181b",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: "#2563eb",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          R
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -1 }}>
          RiggerIQ
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a1a1aa",
            marginTop: 16,
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          Ángulos, tensiones y factores de seguridad para tu maniobra de izaje
        </div>
      </div>
    ),
    { ...size },
  );
}
