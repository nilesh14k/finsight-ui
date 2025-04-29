"use client";
import Image from "next/image";
import { formatCurrency } from "@/utils/currency";

interface StockCardProps {
  data: {
    symbol: string;
    name?: string;
    price: number;
    day_high: number;
    day_low: number;
    prev_close: number;
    timestamp: string;
    logo_url?: string;
    currency?: string;
  } | null;
}

export default function StockCard({ data }: StockCardProps) {
  if (!data) return <p className="text-center py-2">Loading…</p>;

  const diff = data.price - data.prev_close;
  const diffPct = (diff / data.prev_close) * 100;
  const isUp = diff >= 0;
  const diffColor = isUp ? "text-green-600" : "text-red-600";

  return (
    <div className="w-full max-w-md mx-auto text-gray-700">
      <div className="flex items-center space-x-3 mb-3">
        {data.logo_url && (
          <div className="w-10 h-10 relative">
            <Image
              src={data.logo_url}
              alt={`${data.symbol} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold leading-none">{data.symbol}</h2>
          {data.name && <div className="text-sm">{data.name}</div>}
        </div>
      </div>

      {/* Price (no animation!) */}
      <div className="text-2xl font-bold mb-1">
        {formatCurrency(data.price, data.currency)}
      </div>

      {/* +Δ and % change (static color) */}
      <div className={`text-sm font-medium mb-2 ${diffColor}`}>
        {isUp ? "+" : ""}
        {formatCurrency(diff, data.currency)} ({diffPct.toFixed(2)}%)
      </div>

      {/* High, Low, Prev Close */}
      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
        <div>High: {formatCurrency(data.day_high, data.currency)}</div>
        <div>Low: {formatCurrency(data.day_low, data.currency)}</div>
        <div>Prev: {formatCurrency(data.prev_close, data.currency)}</div>
      </div>

      <div className="text-xs text-gray-500">
        Updated {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
