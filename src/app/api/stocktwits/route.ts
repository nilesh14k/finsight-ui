// app/api/stocktwits/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY!);
// Financial‐tuned model
const SENTIMENT_MODEL = "ProsusAI/finbert";
// Supported NER model
const NER_MODEL       = "dslim/bert-base-NER";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  try {
    // 1) fetch up to 20 messages
    const resp = await axios.get(
      `https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`,
      { params: { limit: 20 } }
    );
    const msgs = resp.data.messages || [];

    // 2) enrich with HF FinBERT + NER
    const enriched = await Promise.all(
      msgs.map(async (m: any) => {
        const text = m.body;
        let sentiment: "positive" | "neutral" | "negative" = "neutral";
        let sentiment_score = 0;
        let entities: string[] = [];

        // sentiment via FinBERT with threshold
        try {
          const sc = await hf.textClassification({
            model:  SENTIMENT_MODEL,
            inputs: text,
          });
          const top = sc[0];
          sentiment_score = top.score;
          const raw = top.label.toLowerCase(); // "positive"/"neutral"/"negative"
          if (raw === "positive" && top.score > 0.6) sentiment = "positive";
          else if (raw === "negative" && top.score > 0.6) sentiment = "negative";
        } catch (e) {
          console.warn("[HF] FinBERT error", e);
        }

        // NER
        try {
          const ner = await hf.tokenClassification({
            model:  NER_MODEL,
            inputs: text,
          });
          entities = Array.from(
            new Set(ner.map((x: any) => x.word.trim()).filter(Boolean))
          );
        } catch (e) {
          console.warn("[HF] NER error", e);
        }

        return {
          id:               m.id.toString(),
          text,
          created_at:       m.created_at,
          sentiment,
          sentiment_score,
          entities,
        };
      })
    );

    return NextResponse.json(enriched, { status: 200 });
  } catch (e: any) {
    console.error("StockTwits fetch error:", e.response?.data || e.message);
    return NextResponse.json([], { status: 200 });
  }
}
