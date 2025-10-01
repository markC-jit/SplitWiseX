import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("=== Polymarket Names API Route ===");

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const queryType = searchParams.get("type") || "markets";

    console.log("Query params:", { limit, queryType });

    // Check for API key
    const apiKey = process.env.GRAPH_API_KEY;
    console.log("API Key available:", !!apiKey);

    if (!apiKey) {
      throw new Error(
        "GRAPH_API_KEY is required. Please add it to your .env.local file. Get your API key from https://thegraph.com/studio/",
      );
    }

    // Query based on type
    let query;
    if (queryType === "markets") {
      query = `
        query GetMarkets($first: Int!) {
          markets(first: $first, orderBy: questionID, orderDirection: desc) {
            id
            questionID
            creator
            question
          }
        }
      `;
    } else if (queryType === "priceRequests") {
      query = `
        query GetPriceRequests($first: Int!) {
          priceRequests(first: $first, orderBy: timestamp, orderDirection: desc) {
            id
            requester
            identifier
            timestamp
          }
        }
      `;
    } else {
      // Combined query (default)
      query = `
        query GetMarketsAndPriceRequests($first: Int!) {
          markets(first: $first) {
            id
            questionID
            creator
            question
          }
          priceRequests(first: $first) {
            id
            requester
            identifier
            timestamp
          }
        }
      `;
    }

    const subgraphUrl = "https://gateway.thegraph.com/api/subgraphs/id/22CoTbEtpv6fURB6moTNfJPWNUPXtiFGRA8h1zajMha3";
    console.log("Using Polymarket Names subgraph endpoint...");

    const response = await fetch(subgraphUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        variables: { first: limit },
      }),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HTTP Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log("Subgraph result:", JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return NextResponse.json(
        {
          success: false,
          error: "GraphQL errors",
          details: result.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      queryType,
      totalResults: {
        markets: result.data.markets?.length || 0,
        priceRequests: result.data.priceRequests?.length || 0,
      },
    });
  } catch (error) {
    console.error("=== Polymarket Names API Route Error ===");
    console.error("Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch from Polymarket Names subgraph",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
