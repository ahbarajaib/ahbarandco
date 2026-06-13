import { NextRequest, NextResponse } from "next/server";

/**
 * Reverse geocoding proxy — converts GPS coordinates to a postal address.
 *
 * Why a proxy?
 * - Nominatim's ToS requires a valid User-Agent and prohibits direct
 *   browser calls from production apps.
 * - Calling from the server lets us set User-Agent, add caching, and
 *   swap providers without touching the client code.
 *
 * Provider: Nominatim (OpenStreetMap) — free, no API key required.
 * Rate limit: 1 req/s, which is well within limits for a checkout flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon query parameters are required" },
      { status: 400 }
    );
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json(
      { error: "lat and lon must be valid numbers" },
      { status: 400 }
    );
  }

  try {
    const nominatimUrl = new URL(
      "https://nominatim.openstreetmap.org/reverse"
    );
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("lat", latNum.toFixed(6));
    nominatimUrl.searchParams.set("lon", lonNum.toFixed(6));
    nominatimUrl.searchParams.set("zoom", "18");
    nominatimUrl.searchParams.set("addressdetails", "1");

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        // Required by Nominatim ToS — identifies the calling application
        "User-Agent": "AhbarAndCo/1.0 (ahbarandco.com; contact@ahbarandco.com)",
        "Accept-Language": "en",
      },
      // Cache for 60s — coordinates close together yield the same address
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.address) {
      return NextResponse.json(
        { error: "No address found for these coordinates" },
        { status: 404 }
      );
    }

    const addr = data.address;

    // Normalise the Nominatim response into a clean, flat object
    return NextResponse.json({
      street: [addr.road || addr.street || "", addr.suburb || addr.neighbourhood || addr.village || ""]
        .filter(Boolean)
        .join(", "),
      city: addr.city || addr.town || addr.city_district || addr.county || "",
      state: addr.state || "",
      postalCode: addr.postcode || "",
      country: addr.country || "India",
      raw: data.address, // for debugging — remove in future if not needed
    });
  } catch (error) {
    console.error("[geocode] Reverse geocoding failed:", error);
    return NextResponse.json(
      { error: "Reverse geocoding service unavailable. Please enter your address manually." },
      { status: 503 }
    );
  }
}
