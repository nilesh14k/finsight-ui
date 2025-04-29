"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import StockCard from "./StockCard";
import Chart from "./Chart";
import NewsFeed from "./NewsFeed";
import SocialBuzz from "./SocialBuzz";
import AlertForm from "./AlertForm";
import AlertsList from "./AlertsList";
import WatchlistForm from "./WatchlistForm";
import WatchlistList from "./WatchlistList";
import { useWebSocket } from "../hooks/useWebSocket";

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

export default function StockDashboard({ symbol }: { symbol: string }) {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<{ date: string; close: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsUrl = stockData ? `ws://localhost:8000/ws/price/${stockData.symbol}` : undefined;
  const { data: live } = useWebSocket<{ price: number; high: number; low: number; timestamp: string }>(wsUrl);

  useEffect(() => {
    if (!live) return;
    setStockData((prev) =>
      prev
        ? {
            ...prev,
            price: live.price,
            day_high: live.high,
            day_low: live.low,
            timestamp: live.timestamp,
          }
        : prev
    );
    setChartData((prev) => [
      ...prev,
      { date: new Date(live.timestamp).toLocaleString(), close: live.price },
    ]);
  }, [live]);

  const fetchStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const [priceRes, histRes] = await Promise.all([
        axios.get<StockData>(`${API_BASE}/price?symbol=${symbol}`),
        axios.get<HistoricalDataPoint[]>(`${API_BASE}/history?symbol=${symbol}&range=1mo`),
      ]);
      setStockData(priceRes.data);
      setChartData(histRes.data.map((p) => ({ date: p.date, close: p.close })));
    } catch (err) {
      console.error(err);
      setError(
        axios.isAxiosError(err) && !err.response
          ? "Cannot reach server."
          : "Failed to fetch data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [symbol]);

  useEffect(() => {
    if (!stockData) return;
    const id = setInterval(fetchStock, 30000);
    return () => clearInterval(id);
  }, [stockData]);

  if (error)
    return (
      <p className="text-center text-red-600 py-4">{error}</p>
    );

  if (!stockData || loading)
    return (
      <p className="text-center py-4">Loading {symbol}…</p>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <StockCard data={stockData} />
      {chartData.length > 0 && <Chart data={chartData} />}
      <NewsFeed symbol={symbol} />
      <SocialBuzz symbol={symbol} />
      <AlertForm defaultSymbol={symbol} />
      <AlertsList />
      <WatchlistForm />
      <WatchlistList onLoad={(syms) => window.location.assign(`/stocks/${syms[0]}`)} />
    </div>
  );
}
