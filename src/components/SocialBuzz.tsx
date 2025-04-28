// components/SocialBuzz.tsx
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

const fetcher = (url: string) => axios.get<Tweet[]>(url).then((res) => res.data);

export default function SocialBuzz({ symbol }: { symbol: string }) {
  const cacheKey = useMemo(
    () => (symbol ? `/api/stocktwits?symbol=${symbol}` : null),
    [symbol]
  );

  const { data: tweets, error, isValidating } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60 * 1000,
    shouldRetryOnError: false,
  });

  if (isValidating) return <p className="text-center py-4">Loading social buzz…</p>;
  if (error) return <p className="text-red-600 text-center">Could not load social buzz.</p>;
  if (!tweets || tweets.length === 0)
    return <p className="text-center text-gray-600">No recent tweets.</p>;

  const pos = tweets.filter((t) => t.sentiment === "positive").length;
  const neu = tweets.filter((t) => t.sentiment === "neutral").length;
  const neg = tweets.filter((t) => t.sentiment === "negative").length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Social Buzz for {symbol}</h3>

      <div className="flex space-x-4 mb-6">
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">👍 {pos}</span>
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">😐 {neu}</span>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">👎 {neg}</span>
      </div>

      <ul className="space-y-4">
        {tweets.map((t) => (
          <li key={t.id} className="border-b pb-3">
            <p className="text-sm">{t.text}</p>
            <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(t.created_at).toLocaleString()}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
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
  );
}
