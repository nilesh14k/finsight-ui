"use client";

import useSWR from "swr";
import axios from "axios";
import { useMemo } from "react";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  sentiment: "positive" | "neutral" | "negative";
}

const fetcher = (url: string) =>
  axios.get<Tweet[]>(url).then((res) => res.data);

export default function SocialBuzz({ symbol }: { symbol: string }) {
  const cacheKey = useMemo(
    () => (symbol ? `/api/stocktwits?symbol=${symbol}` : null),
    [symbol]
  );

  const { data: tweets, error, isValidating } = useSWR(
    cacheKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 1000,
      shouldRetryOnError: false,
    }
  );

  if (isValidating)
    return <p className="text-center py-2">Loading social buzz…</p>;
  if (error)
    return (
      <p className="text-red-600 text-center py-2">
        Could not load social buzz.
      </p>
    );
  if (!tweets || tweets.length === 0)
    return (
      <p className="text-center text-gray-600 py-2">No recent tweets.</p>
    );

  const pos = tweets.filter((t) => t.sentiment === "positive").length;
  const neu = tweets.filter((t) => t.sentiment === "neutral").length;
  const neg = tweets.filter((t) => t.sentiment === "negative").length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">
        Social Buzz for {symbol}
      </h3>

      <div className="flex space-x-3 mb-4 text-sm">
        <span className="px-1 rounded bg-green-100 text-green-800">
          👍 {pos}
        </span>
        <span className="px-1 rounded bg-gray-100 text-gray-800">
          😐 {neu}
        </span>
        <span className="px-1 rounded bg-red-100 text-red-800">
          👎 {neg}
        </span>
      </div>

      <div className="max-h-96 overflow-auto">
        <ul className="divide-y">
          {tweets.map((t) => (
            <li key={t.id} className="py-2">
              <p className="text-sm">{t.text}</p>
              <div className="mt-1 flex justify-between text-xs text-gray-600">
                <span>{new Date(t.created_at).toLocaleString()}</span>
                <span
                  className={`px-1 rounded text-xs font-medium ${
                    t.sentiment === "positive"
                      ? "bg-green-100 text-green-800"
                      : t.sentiment === "negative"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {t.sentiment}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}