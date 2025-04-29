// src/app/api/get-region/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Still edge runtime

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim();

  let country = "US";

  // If IP is localhost (127.0.0.1 or ::1), skip geolocation
  if (ip === "127.0.0.1" || ip === "::1") {
    country = "US";
  } else {
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`);
      const data = await res.json();
      if (data.status === "success" && data.countryCode) {
        country = data.countryCode;
      }
    } catch (e) {
      // fallback to US silently
    }
  }

  return NextResponse.json({ country });
}
