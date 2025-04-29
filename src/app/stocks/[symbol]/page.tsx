// src/app/stocks/[symbol]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import StockCard from "@/components/StockCard";
import Chart from "@/components/Chart";
import NewsFeed from "@/components/NewsFeed";
import SocialBuzz from "@/components/SocialBuzz";
import AlertForm from "@/components/AlertForm";
import AlertsList from "@/components/AlertsList";
import WatchlistForm from "@/components/WatchlistForm";
import WatchlistList from "@/components/WatchlistList";
import { useWebSocket } from "@/hooks/useWebSocket";
import KeyStats from "@/components/KeyStats";
import CompanyProfile from "@/components/CompanyProfile";
import { formatCurrency } from "@/utils/currency";

interface StockData {
  symbol: string;
  name?: string;
  price: number;
  day_high: number;
  day_low: number;
  prev_close: number;
  timestamp: string;
  logo_url?: string;
  currency?: string;
  market_cap?: number;
  fifty_two_wk_high?: number;
  fifty_two_wk_low?: number;
  volume?: number;
  avg_volume?: number;
  trailing_pe?: number;
  forward_pe?: number;
  eps?: number;
  dividend_yield?: number;
  next_earnings?: string;
  ex_dividend_date?: string;
  sector?: string;
  industry?: string;
  country?: string;
  website?: string;
}

export default function StockPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const { symbol } = useParams<{ symbol: string }>();
  const router = useRouter();

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<{ date: string; close: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("1mo");
  const wsUrl = stockData ? `ws://localhost:8000/ws/price/${stockData.symbol}` : undefined;
  const { data: live } = useWebSocket<{ price: number; high: number; low: number; timestamp: string }>(wsUrl);

  useEffect(() => {
    if (live && stockData) {
      setStockData({ ...stockData, price: live.price, day_high: live.high, day_low: live.low, timestamp: live.timestamp });
      setChartData(prev => [
        ...prev,
        {
          date: new Date(live.timestamp).toISOString().slice(0, 10),
          close: live.price,
        },
      ]);
    }
  }, [live]);

  const fetchStock = async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const res = await axios.get<StockData>(`${API_BASE}/price`, { params: { symbol } });
      setStockData(res.data);
      const hist = await axios.get<{ date: string; close: number }[]>(
        `${API_BASE}/history`,
        { params: { symbol, range } }
      );
      setChartData(hist.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [symbol, range]);

  if (!symbol) return <p className="p-4 text-center">Invalid symbol.</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        {loading || !stockData ? (
          <p className="text-center py-8">Loading…</p>
        ) : (
          <div className="flex items-center justify-between">
            <StockCard data={stockData} />
            <>
            <KeyStats
              stats={[
                { label: "Market Cap", value: stockData.market_cap, currency: stockData.currency },
                { label: "52W High", value: stockData.fifty_two_wk_high },
                { label: "52W Low", value: stockData.fifty_two_wk_low },
                { label: "Volume", value: stockData.volume, currency: stockData.currency },
                { label: "Avg Volume", value: stockData.avg_volume, currency: stockData.currency },
                { label: "P/E (T)", value: stockData.trailing_pe },
                { label: "P/E (F)", value: stockData.forward_pe },
                { label: "EPS", value: stockData.eps },
                { label: "Yield", value: stockData.dividend_yield ? `${(stockData.dividend_yield || 0) * 100}%` : null },
                { label: "Next Earnings", value: stockData.next_earnings ? new Date(stockData.next_earnings).toLocaleDateString() : null },
                { label: "Ex-Div Date", value: stockData.ex_dividend_date ? new Date(stockData.ex_dividend_date).toLocaleDateString() : null },
              ]}
            />
              <CompanyProfile data={stockData} />
            </>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="space-x-2">
            {["1d", "5d", "1mo", "3mo", "6mo", "1y", "5y"].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded ${range === r ? "bg-blue-600 text-white" : "bg-white border"}`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <Chart
          data={chartData.map(item => ({
            time: item.date,
            value: item.close,
          }))}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h4 className="text-lg font-semibold">Watchlists</h4>
            <WatchlistList onLoad={syms => router.push(`/stocks/${syms[0]}`)} />
            <WatchlistForm onCreated={fetchStock} />
          </div>
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h4 className="text-lg font-semibold">Alerts</h4>
            <AlertsList />
            <AlertForm defaultSymbol={symbol} />
          </div>
        </aside>

        <section className="col-span-9 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-lg font-semibold mb-2">Latest News</h4>
            <NewsFeed symbol={symbol} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-lg font-semibold mb-2">Social Buzz</h4>
            <SocialBuzz symbol={symbol} />
          </div>
        </section>
      </div>
    </main>
  );
}