"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import TrendingStocks from "@/components/TrendingStocks";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regionParam = searchParams.get("region");

  useEffect(() => {
    async function detectRegion() {
      if (regionParam) return;

      try {
        // First, try server-side (fast in production)
        const res = await fetch("/api/get-region");
        const data = await res.json();
        let region = data.country || "US";

        // If still US and on localhost, fallback to client-based IP detection
        if (region === "US" && window.location.hostname === "localhost") {
          const ipapi = await fetch("https://ipapi.co/json");
          const ipdata = await ipapi.json();
          if (ipdata && ipdata.country) {
            region = ipdata.country;
          }
        }

        router.replace(`/?region=${region}`);
      } catch {
        router.replace("/?region=US");
      }
    }

    detectRegion();
  }, [regionParam, router]);

  const region = regionParam?.toUpperCase() || "US";

  const handleSearch = (symbol: string) => {
    router.push(`/stocks/${symbol}?region=${region}`);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Track Your Stocks
        </h1>

        <div className="max-w-md mx-auto mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="max-w-5xl mx-auto">
          <TrendingStocks region={region} onSelect={handleSearch} />
        </div>
      </div>
    </main>
  );
}
