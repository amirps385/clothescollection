import { NextRequest, NextResponse } from "next/server";
import { PINCODE_PATTERN, normaliseState } from "@/lib/india";

/**
 * PIN-code lookup, proxied through our own server rather than called from the
 * browser: avoids CORS surprises, lets us cache, and keeps the upstream
 * response shape from leaking into the client.
 *
 * Mirrors how Amazon/Flipkart fill city and state from the PIN code.
 */
export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin")?.trim() ?? "";

  if (!PINCODE_PATTERN.test(pin)) {
    return NextResponse.json(
      { error: "Enter a 6-digit PIN code" },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      // PIN codes barely change; cache for a day.
      next: { revalidate: 86400 },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not look up that PIN code right now" },
      { status: 503 }
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Could not look up that PIN code right now" },
      { status: 503 }
    );
  }

  const body = await upstream.json().catch(() => null);
  const entry = Array.isArray(body) ? body[0] : null;

  if (!entry || entry.Status !== "Success" || !Array.isArray(entry.PostOffice)) {
    return NextResponse.json(
      { found: false, error: "We couldn't find that PIN code" },
      { status: 404 }
    );
  }

  const offices = entry.PostOffice as Array<{
    Name?: string;
    Block?: string;
    District?: string;
    State?: string;
  }>;

  const district = offices[0]?.District?.trim() ?? "";
  const state = normaliseState(offices[0]?.State ?? "");

  // Locality names for the area dropdown, de-duplicated and sorted.
  const localities = [
    ...new Set(
      offices
        .map((o) => o.Name?.trim())
        .filter((n): n is string => Boolean(n))
    ),
  ].sort((a, b) => a.localeCompare(b));

  return NextResponse.json({ found: true, pin, state, district, localities });
}
