"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  entities: string[];
}

export default function NewsFeed({ symbol }: { symbol: string }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    axios
      .get<NewsArticle[]>(`/api/news?symbol=${symbol}`)
      .then((res) => setArticles(res.data))
      .catch((e) => {
        console.error(e);
        setError("Could not load news.");
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return <p className="text-center py-4">Loading news…</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (articles.length === 0)
    return <p className="text-center text-gray-600">No recent news.</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Latest News for {symbol}</h3>
      <ul className="space-y-6">
        {articles.map((a, i) => (
          <li key={i} className="border-b pb-4">
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium text-lg"
            >
              {a.title}
            </a>
            <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
              <span>{a.source}</span>
              <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
            </div>
            {a.description && <p className="mt-2 text-gray-700">{a.description}</p>}

            {/* Sentiment badge and score */}
            <div className="mt-3 flex items-center space-x-2">
              <span
                className={
                  `inline-block px-2 py-1 rounded-full text-xs font-medium ` +
                  (a.sentiment === "positive"
                    ? "bg-green-100 text-green-800"
                    : a.sentiment === "negative"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800")
                }
              >
                {a.sentiment}
              </span>
              <span className="text-xs text-gray-500">
                Score: {a.sentiment_score.toFixed(2)}
              </span>
            </div>

            {a.entities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {a.entities.map((entity) => (
                  <span
                    key={entity}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
