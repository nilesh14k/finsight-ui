"use client";

import React, { useEffect, useState, useRef } from "react";
import clsx from "clsx";

interface TrendingSummary {
  symbol:   string;
  name?:    string;
  logo_url?:string;
}

interface PriceDetail {
  price:      number;
  prev_close: number;
}

interface PriceResponse {
  symbol:      string;
  price:       number;
  prev_close:  number;
}

interface ExchangeConfig {
  region:   string;   // e.g. "US" or "IN"
  timezone: string;   // IANA tz
  open:     string;   // "HH:MM"
  close:    string;   // "HH:MM"
}

export default function TrendingStocks({
  onSelect,
  region,           // now required
}: {
  onSelect: (symbol: string) => void;
  region:   string;
}) {
  const API     = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
  const WS_BASE = (API.startsWith("https") ? "wss" : "ws") + API.slice(API.indexOf(":"));

  const [exchangeCfg, setExchangeCfg] = useState<ExchangeConfig | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [tickers, setTickers] = useState<TrendingSummary[] | null>(null);
  const [prices, setPrices] = useState<Record<string, PriceDetail>>({});
  const socketsRef = useRef<Record<string, WebSocket>>({});

  // 1) fetch exchange-config
  useEffect(() => {
    setExchangeCfg(null);
    fetch(`${API}/exchange-config?region=${region}`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<ExchangeConfig>;
      })
      .then(setExchangeCfg)
      .catch(console.error);
  }, [API, region]);

  // 2) update clock
  useEffect(() => {
    if (!exchangeCfg) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [exchangeCfg]);

  // helper to get local hour/minute/day in tz
  function getLocalHMDay(date: Date, tz: string) {
    const df = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12:   false,
      hour:     "2-digit",
      minute:   "2-digit",
      weekday:  "short",
    });
    const parts  = df.formatToParts(date);
    const hour   = +parts.find(p => p.type === "hour")!.value;
    const minute = +parts.find(p => p.type === "minute")!.value;
    const wd     = parts.find(p => p.type === "weekday")!.value as string;
    const dayIdx = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(wd);
    return { hour, minute, dayIdx };
  }

  // 3) market open?
  const isMarketOpen = (() => {
    if (!exchangeCfg) return false;
    const { hour, minute, dayIdx } = getLocalHMDay(now, exchangeCfg.timezone);
    const [oh, om] = exchangeCfg.open.split(":").map(Number);
    const [ch, cm] = exchangeCfg.close.split(":").map(Number);
    const afterOpen   = hour > oh || (hour === oh && minute >= om);
    const beforeClose = hour < ch || (hour === ch && minute <= cm);
    return dayIdx >= 1 && dayIdx <= 5 && afterOpen && beforeClose;
  })();

  // 4) formatted clock YYYY-MM-DD HH:mm
  const clockStr = exchangeCfg
    ? new Intl.DateTimeFormat("sv", {
        timeZone: exchangeCfg.timezone,
        year:     "numeric",
        month:    "2-digit",
        day:      "2-digit",
        hour:     "2-digit",
        minute:   "2-digit",
        hour12:   false,
      }).format(now)
    : "--";

  // 5) fetch trending list
  useEffect(() => {
    setTickers(null);
    fetch(`${API}/trending?region=${region}`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<TrendingSummary[]>;
      })
      .then(setTickers)
      .catch(() => setTickers([]));
  }, [API, region]);

  // 6) fetch initial prices
  useEffect(() => {
    if (!tickers || tickers.length === 0) return;
    tickers.forEach(async t => {
      try {
        const r = await fetch(`${API}/price?symbol=${t.symbol}`);
        if (!r.ok) throw new Error();
        const { price, prev_close } = (await r.json()) as PriceResponse;
        setPrices(p => ({ ...p, [t.symbol]: { price, prev_close } }));
      } catch {
        /* swallow errors */
      }
    });
  }, [API, tickers]);

  // 7) live WebSocket updates
  useEffect(() => {
    Object.values(socketsRef.current).forEach(ws => ws.close());
    socketsRef.current = {};

    if (tickers) {
      tickers.forEach(t => {
        const ws = new WebSocket(`${WS_BASE}/ws/price/${t.symbol}`);
        ws.onmessage = e => {
          try {
            const { price } = JSON.parse(e.data) as { price: number };
            setPrices(prev => ({
              ...prev,
              [t.symbol]: {
                price,
                prev_close: prev[t.symbol]?.prev_close ?? price,
              },
            }));
          } catch {}
        };
        socketsRef.current[t.symbol] = ws;
      });
    }

    return () =>
      Object.values(socketsRef.current).forEach(ws => ws.close());
  }, [WS_BASE, tickers]);

  // loading state
  if (!exchangeCfg || tickers === null) {
    return <div className="py-10 text-center text-gray-500">Loading…</div>;
  }
  // empty fallback
  if (tickers.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        No trending stocks for <strong>{exchangeCfg.region}</strong>.
      </div>
    );
  }

  // render grid
  return (
    <section className="mb-8">
      {/* header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={clsx(
              "w-3 h-3 rounded-full",
              isMarketOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
            )}
          />
          <span className="font-medium">
            {isMarketOpen ? "Market Open" : "Market Closed"}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{exchangeCfg.region}</span>{" "}
          {clockStr}
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tickers.map(t => {
          const pd      = prices[t.symbol];
          const hasPrev = pd && pd.prev_close > 0;
          const change  = hasPrev ? pd.price - pd.prev_close : 0;
          const pct     = hasPrev ? (change / pd.prev_close) * 100 : 0;
          const up      = change >= 0;

          return (
            <button
              key={t.symbol}
              onClick={() => onSelect(t.symbol)}
              className="flex flex-col justify-between border border-gray-200 p-4 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {t.logo_url ? (
                    <img
                      src={t.logo_url}
                      alt={`${t.symbol} logo`}
                      className="w-6 h-6"
                      onError={e =>
                        (e.currentTarget.src = "/placeholder-logo.png")
                      }
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {t.symbol}
                  </span>
                </div>
                <div
                  className={clsx(
                    "w-2 h-2 rounded-full",
                    isMarketOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )}
                />
              </div>

              <div className="mt-2 space-y-1">
                <span className="block text-lg font-semibold text-gray-900">
                  {pd ? `$${pd.price.toFixed(2)}` : "--"}
                </span>
                {hasPrev && (
                  <span className="block text-xs text-gray-500">
                    Prev Close: ${pd.prev_close.toFixed(2)}
                  </span>
                )}
                {hasPrev && (
                  <span
                    className={clsx(
                      "text-sm font-medium",
                      up ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)} (
                    {up ? "+" : "-"}
                    {Math.abs(pct).toFixed(2)}%)
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-600 truncate">
                {t.name}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
