// app/api/twitter/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY!);
const SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest";
const NER_MODEL       = "Jean-Baptiste/roberta-large-ner-english";

const STUB = {
  id:              "stub1",
  text:            "Unable to fetch live tweets—showing stub data",
  created_at:      new Date().toISOString(),
  sentiment:       "neutral" as const,
  sentiment_score: 0,
  entities:        [] as string[],
};

const CACHE_TTL = 60 * 1000;
type CacheEntry = { ts: number; data: any[] };
const cache = new Map<string, CacheEntry>();

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }
  const now = Date.now();
  const hit = cache.get(symbol);
  if (hit && now - hit.ts < CACHE_TTL) {
    return NextResponse.json(hit.data, { status: 200 });
  }

  let tweets: { id: string; text: string; created_at: string }[] = [];
  try {
    const resp = await axios.get("https://api.twitter.com/2/tweets/search/recent", {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
      params: {
        query: `${symbol} -is:retweet lang:en`,
        max_results: 10,
        "tweet.fields": "created_at,text",
      },
    });
    tweets = resp.data.data || [];
  } catch (e: any) {
    console.error("Twitter fetch error:", e.response?.data || e.message);
    cache.set(symbol, { ts: now, data: [STUB] });
    return NextResponse.json([STUB], { status: 200 });
  }

  if (tweets.length === 0) {
    cache.set(symbol, { ts: now, data: [STUB] });
    return NextResponse.json([STUB], { status: 200 });
  }

  const enriched = await Promise.all(
    tweets.map(async (t) => {
      let sentiment: "positive" | "neutral" | "negative" = "neutral";
      let sentiment_score = 0;
      let entities: string[] = [];

      try {
        const sc = await hf.textClassification({
          model:  SENTIMENT_MODEL,
          inputs: t.text,
        });
        const top = sc[0];
        sentiment_score = top.score;
        if (top.label === "POSITIVE" && top.score > 0.6) sentiment = "positive";
        if (top.label === "NEGATIVE" && top.score > 0.6) sentiment = "negative";
      } catch (e) {
        console.warn("[HF] sentiment error on tweet", t.id, e);
      }

      try {
        const nr = await hf.tokenClassification({
          model:  NER_MODEL,
          inputs: t.text,
        });
        entities = Array.from(new Set(nr.map((x) => x.word.trim()).filter(Boolean)));
      } catch (e) {
        console.warn("[HF] NER error on tweet", t.id, e);
      }

      return {
        id:              t.id,
        text:            t.text,
        created_at:      t.created_at,
        sentiment,
        sentiment_score,
        entities,
      };
    })
  );

  cache.set(symbol, { ts: now, data: enriched });
  return NextResponse.json(enriched, { status: 200 });
}
