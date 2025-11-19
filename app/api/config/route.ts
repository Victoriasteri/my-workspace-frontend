import { NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/config/env";

/**
 * Internal API endpoint to provide configuration to the client.
 *
 * This endpoint is server-side only, so the API URL is never exposed
 * in the client bundle. The client fetches this at runtime.
 *
 * GET /api/config
 */
export async function GET() {
  try {
    const apiBaseUrl = getServerApiBaseUrl();

    return NextResponse.json({
      apiBaseUrl,
    });
  } catch (error) {
    console.error("Error getting server config:", error);
    return NextResponse.json(
      { error: "Failed to get configuration" },
      { status: 500 }
    );
  }
}
