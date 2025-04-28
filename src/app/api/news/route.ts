import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY!);
// this SST-2 model returns POSITIVE/NEGATIVE
const SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english";
// ← switched to the same supported NER model
const NER_MODEL       = "dslim/bert-base-NER";

console.log("🔑 NEWS_API_KEY:", process.env.NEWS_API_KEY ? "✔️ loaded" : "❌ missing");
console.log("🔑 HF_API_KEY:   ", process.env.HF_API_KEY   ? "✔️ loaded" : "❌ missing");

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Symbol query is required" }, { status: 400 });
  }

  try {
    // fetch top 5 articles
    const resp = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q:        symbol,
        apiKey:   process.env.NEWS_API_KEY,
        sortBy:   "publishedAt",
        pageSize: 5,
      },
    });
    const articles = resp.data.articles || [];

    // enrich each
    const processed = await Promise.all(
      articles.map(async (a: any) => {
        const text = `${a.title}. ${a.description ?? ""}`;

        let sentiment: "positive" | "neutral" | "negative" = "neutral";
        let sentiment_score = 0;
        let entities: string[] = [];

        // — sentiment
        try {
          const sc = await hf.textClassification({
            model:  SENTIMENT_MODEL,
            inputs: text,
          });
          const top = sc[0];
          sentiment_score = top.score;
          if (top.label === "POSITIVE" && top.score > 0.6) sentiment = "positive";
          if (top.label === "NEGATIVE" && top.score > 0.6) sentiment = "negative";
        } catch (e) {
          console.warn("[HF] sentiment failed for", a.title, e);
        }

        // — NER with the supported model
        try {
          const nr = await hf.tokenClassification({
            model:  NER_MODEL,
            inputs: text,
          });
          entities = Array.from(
            new Set(nr.map((e) => e.word.trim()).filter(Boolean))
          );
        } catch (e) {
          console.warn("[HF] NER failed for", a.title, e);
        }

        return {
          title:        a.title,
          url:          a.url,
          source:       a.source.name,
          publishedAt:  a.publishedAt,
          description:  a.description,
          sentiment,
          sentiment_score,
          entities,
        } as const;
      })
    );

    return NextResponse.json(processed);
  } catch (err: any) {
    console.error("News API / HF error:", err.response?.data || err.message);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
