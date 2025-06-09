// /api/fetchTokens/route.ts

import { NextRequest } from "next/server";

const tokens = [
    { name: "Pepe", mint: "B5WTLaRwaUQpKk7ir1wniNB6m5o8GgMrimhKMYan2R6B" },
    { name: "SHMOO", mint: "9jMimgpDjD3utQa7QCSj9WNTCwaGGbz5MGHYM1oQpump" },
    { name: "MAPE", mint: "9hHhBNtxduB3VMmkWNq5wjUve94NiesjCqNm3tkRitji" },
    { name: "rCat", mint: "6HPn7g66xzFQPfvxiyTxTVgKxH12ze3NkQhEnTFZpump" },
    { name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
    { name: "Trump", mint: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN" },
];

export async function GET() {
  try {
    const metadataPromises = tokens.map(async (token) => {
      const res = await fetch(
        `https://lite-api.jup.ag/tokens/v1/token/${token.mint}`
      );
      if (!res.ok) {
        console.warn(`Failed to fetch metadata for ${token.name}`);
        return null;
      }
      const meta = await res.json();
      return {
        ...token,
        ...meta, // merges price, decimals, logoURI etc.
      };
    });

    const enriched = (await Promise.all(metadataPromises)).filter(Boolean);

    return new Response(JSON.stringify(enriched), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch token data" }), {
      status: 500,
    });
  }
}
