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

  if (loading) return <p className="text-center py-2">Loading news…</p>;
  if (error) return <p className="text-red-600 text-center py-2">{error}</p>;
  if (articles.length === 0)
    return <p className="text-center text-gray-600 py-2">No recent news.</p>;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Latest News for {symbol}</h3>
      {/* Scrollable container when compressed */}
      <div className="max-h-96 overflow-auto">
        <ul className="divide-y">
          {articles.map((a, i) => (
            <li key={i} className="py-2">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {a.title}
              </a>
              <div className="mt-1 text-xs text-gray-600 flex justify-between">
                <span>{a.source}</span>
                <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
              </div>
              {a.description && (
                <p className="mt-1 text-gray-700 text-sm">{a.description}</p>
              )}

              <div className="mt-2 flex items-center space-x-2 text-sm">
                <span
                  className={`px-1 rounded ${
                    a.sentiment === "positive"
                      ? "bg-green-100 text-green-800"
                      : a.sentiment === "negative"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {a.sentiment}
                </span>
                <span>Score: {a.sentiment_score.toFixed(2)}</span>
              </div>

              {a.entities.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 text-xs">
                  {a.entities.map((entity) => (
                    <span
                      key={entity}
                      className="px-1 border rounded"
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
    </div>
  );
}
