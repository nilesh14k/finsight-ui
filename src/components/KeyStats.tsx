// src/components/KeyStats.tsx
"use client";

import { formatLargeNumber } from "@/utils/numberFormat";

interface KeyStatsProps {
  stats: {
    label: string;
    value: string | number | null;
    currency?: string;
  }[];
}

export default function KeyStats({ stats }: KeyStatsProps) {
  return (
    <div className="w-full max-w-lg mx-auto text-sm text-gray-700">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-sm font-medium">
              {s.value == null ? (
                "—"
              ) : typeof s.value === "number" && (
                  s.label.includes("Market Cap") ||
                  s.label.includes("Volume") ||
                  s.label.includes("Avg Volume")
              ) ? (
                <span title={s.value.toLocaleString()}>
                  {formatLargeNumber(s.value, s.currency)}
                </span> // ✅ Tooltip showing full number
              ) : (
                s.value
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
