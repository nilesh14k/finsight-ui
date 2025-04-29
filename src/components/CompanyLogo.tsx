"use client";
import { useState } from "react";

export default function CompanyLogo({ symbol }: { symbol: string }) {
  const [error, setError] = useState(false);
  const url = `https://logo.clearbit.com/${symbol.toLowerCase()}.com?size=64`;
  if (error) return null;
  return (
    <img
      src={url}
      alt={`${symbol} logo`}
      width={48}
      height={48}
      onError={() => setError(true)}
      className="rounded mr-4"
    />
  );
}
