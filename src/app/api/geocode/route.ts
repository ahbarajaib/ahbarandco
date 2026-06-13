import { NextRequest, NextResponse } from "next/server";

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResult {
  address_components?: GoogleAddressComponent[];
  formatted_address?: string;
}

interface GoogleGeocodeResponse {
  results?: GoogleGeocodeResult[];
  status?: string;
  error_message?: string;
}

interface NominatimAddress {
  road?: string;
  street?: string;
  suburb?: string;
  neighbourhood?: string;
  village?: string;
  city?: string;
  town?: string;
  city_district?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

function parseGoogleAddress(results: GoogleGeocodeResult[]) {
  if (!results || results.length === 0) return null;

  const firstResult = results[0];
  const components = firstResult.address_components || [];

  let streetNumber = "";
  let route = "";
  let sublocality = "";
  let locality = "";
  let administrativeAreaLevel1 = "";
  let postalCode = "";
  let country = "";

  for (const component of components) {
    const types = component.types || [];
    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    } else if (types.includes("route")) {
      route = component.long_name;
    } else if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
      sublocality = component.long_name;
    } else if (types.includes("locality")) {
      locality = component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      administrativeAreaLevel1 = component.long_name;
    } else if (types.includes("postal_code")) {
      postalCode = component.long_name;
    } else if (types.includes("country")) {
      country = component.long_name;
    }
  }

  // Build a nice street name: "StreetNumber Route, Sublocality" or just "Route, Sublocality"
  const streetParts: string[] = [];
  const roadPart = [streetNumber, route].filter(Boolean).join(" ");
  if (roadPart) streetParts.push(roadPart);
  if (sublocality) streetParts.push(sublocality);

  return {
    street: streetParts.join(", ") || firstResult.formatted_address || "",
    city: locality || sublocality || "",
    state: administrativeAreaLevel1 || "",
    postalCode: postalCode || "",
    country: country || "India",
  };
}

/**
 * Reverse geocoding proxy — converts GPS coordinates to a postal address.
 *
 * Support for both Google Maps Geocoding API and Nominatim (OpenStreetMap).
 * Google Maps is used if GOOGLE_MAPS_API_KEY is defined in the environment.
 * Otherwise, it falls back to Nominatim (OpenStreetMap) which is free.
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

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    if (apiKey) {
      // 1. Google Maps Geocoding API
      const googleUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      googleUrl.searchParams.set("latlng", `${latNum.toFixed(6)},${lonNum.toFixed(6)}`);
      googleUrl.searchParams.set("key", apiKey);

      const response = await fetch(googleUrl.toString(), {
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`Google Geocoding API returned status ${response.status}`);
      }

      const data = (await response.json()) as GoogleGeocodeResponse;

      if (data.status !== "OK" || !data.results) {
        throw new Error(`Google Geocoding API status was ${data.status}: ${data.error_message || ""}`);
      }

      const parsed = parseGoogleAddress(data.results);
      if (!parsed) {
        return NextResponse.json(
          { error: "No address found for these coordinates" },
          { status: 404 }
        );
      }

      return NextResponse.json(parsed);
    } else {
      // 2. Nominatim (OpenStreetMap) Fallback
      const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
      nominatimUrl.searchParams.set("format", "json");
      nominatimUrl.searchParams.set("lat", latNum.toFixed(6));
      nominatimUrl.searchParams.set("lon", lonNum.toFixed(6));
      nominatimUrl.searchParams.set("zoom", "18");
      nominatimUrl.searchParams.set("addressdetails", "1");

      const response = await fetch(nominatimUrl.toString(), {
        headers: {
          "User-Agent": "AhbarAndCo/1.0 (ahbarandco.com; contact@ahbarandco.com)",
          "Accept-Language": "en",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`Nominatim returned ${response.status}`);
      }

      const data = (await response.json()) as NominatimResponse;

      if (!data.address) {
        return NextResponse.json(
          { error: "No address found for these coordinates" },
          { status: 404 }
        );
      }

      const addr = data.address;

      return NextResponse.json({
        street: [addr.road || addr.street || "", addr.suburb || addr.neighbourhood || addr.village || ""]
          .filter(Boolean)
          .join(", "),
        city: addr.city || addr.town || addr.city_district || addr.county || "",
        state: addr.state || "",
        postalCode: addr.postcode || "",
        country: addr.country || "India",
      });
    }
  } catch (error) {
    console.error("[geocode] Reverse geocoding failed:", error);
    return NextResponse.json(
      { error: "Reverse geocoding service unavailable. Please enter your address manually." },
      { status: 503 }
    );
  }
}
