"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import StockCard from "@/components/StockCard";
import Chart from "@/components/Chart";
import AlertForm from "@/components/AlertForm";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface StockData {
  symbol: string;
  price: number;
  day_high: number;
  day_low: number;
  prev_close: number;
  timestamp: string;
}

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const trendingStocks = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL"];

export default function Home() {
  const [symbol, setSymbol] = useState<string>("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [historyData, setHistoryData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async (searchSymbol?: string) => {
    const finalSymbol = (searchSymbol || symbol).toUpperCase();
    setLoading(true);
    setError(null);
    try {
      const priceRes = await axios.get<StockData>(`${API_BASE}/price?symbol=${finalSymbol}`);
      const histRes = await axios.get<HistoricalDataPoint[]>(`${API_BASE}/history?symbol=${finalSymbol}&range=1mo`);
      setStockData(priceRes.data);
      setHistoryData(histRes.data);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch data. Please check the symbol.");
      setStockData(null);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when viewing a stock
  useEffect(() => {
    if (!stockData) return;
    const interval = setInterval(() => fetchStock(), 30000);
    return () => clearInterval(interval);
  }, [stockData]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {!stockData ? (
          <section className="text-center">
            <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
              📈 Track Your Stocks Effortlessly
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Live data, instant alerts, beautiful charts.
            </p>
            <div className="flex justify-center mb-10">
              <input
                type="text"
                placeholder="AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="border rounded-l-lg px-4 py-2 w-64 focus:outline-none"
              />
              <button
                onClick={() => fetchStock()}
                disabled={!symbol || loading}
                className="bg-blue-600 text-white rounded-r-lg px-6 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              🔥 Trending Stocks
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {trendingStocks.map((stk) => (
                <button
                  key={stk}
                  onClick={() => fetchStock(stk)}
                  className="bg-white py-3 rounded-lg shadow hover:bg-blue-50 transition"
                >
                  {stk}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-8">
            {error && <p className="text-red-600">{error}</p>}
            <StockCard data={stockData} />
            {historyData.length > 0 && <Chart data={historyData.map(({ date, close }) => ({ date, close }))} />}
            <AlertForm defaultSymbol={stockData.symbol} />
            <button
              onClick={() => { setStockData(null); setHistoryData([]); setError(null); setSymbol(""); }}
              className="text-blue-600 hover:underline"
            >
              ← Back to Home
            </button>
          </section>
        )}
      </div>
    </main>
  );
}