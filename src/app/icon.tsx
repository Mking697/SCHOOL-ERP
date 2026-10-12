import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5, #4338ca)",
          borderRadius: 32,
        }}
      >
        <span style={{ fontSize: 96, color: "white", fontWeight: 700 }}>S</span>
      </div>
    ),
    { ...size }
  );
}
