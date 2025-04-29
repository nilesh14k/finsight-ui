"use client";

import { useRouter } from "next/navigation";
import TrendingStocks from "@/components/TrendingStocks";
import WatchlistList from "@/components/WatchlistList";
import AlertForm from "@/components/AlertForm";
import AlertsList from "@/components/AlertsList";
import SearchBar from "@/components/SearchBar";

export default function DashboardPage() {
  const router = useRouter();
  const handleSearch = (symbol: string) => {
    router.push(`/stocks/${symbol}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Search */}
        <div className="mb-8 max-w-md">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Watchlist & Alerts */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Your Watchlist</h2>
              <WatchlistList onLoad={(symbols) => router.push(`/stocks/${symbols[0]}`)} />
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Price Alerts</h2>
              <AlertForm />
              <div className="mt-4">
                <AlertsList />
              </div>
            </div>
          </div>

          {/* Middle column: Trending Stocks */}
          <div className="bg-white border border-gray-200 p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Trending Stocks</h2>
            <TrendingStocks onSelect={handleSearch} />
          </div>

          {/* Bottom full-width placeholders */}
          <div className="lg:col-span-3 space-y-6 mt-6">
            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
              <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500">
                Placeholder: Portfolio Chart
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Latest News</h2>
              <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500">
                Placeholder: News Feed
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
