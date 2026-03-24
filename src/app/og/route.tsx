import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Irem Blog";
  const category = searchParams.get("category") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #fdf8f0 0%, #f7ead8 50%, #edd5b0 100%)",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Decorative top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(to right, #edba6e, #b87333)",
          }}
        />

        {/* Site name */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "60px",
            fontSize: "20px",
            fontWeight: 600,
            color: "#9a5e28",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Irem Blog
        </div>

        {/* Category */}
        {category && (
          <div
            style={{
              display: "inline-flex",
              marginBottom: "20px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "#ddb87e",
              color: "#3d2210",
              fontSize: "16px",
              fontWeight: 600,
              width: "fit-content",
              letterSpacing: "0.03em",
            }}
          >
            {category}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? "44px" : "56px",
            fontWeight: 700,
            color: "#292524",
            lineHeight: 1.2,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Bottom decoration */}
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            right: "60px",
            width: "120px",
            height: "4px",
            background: "linear-gradient(to right, #edba6e, #b87333)",
            borderRadius: "2px",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
