"use client";
import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (symbol: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [input, setInput] = useState("");

  const submit = () => {
    const s = input.trim().toUpperCase();
    if (s) onSearch(s);
  };

  return (
    <div className="flex justify-center mb-8">
      <input
        type="text"
        placeholder="Enter ticker…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="border rounded-l-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={submit}
        className="bg-blue-600 text-white rounded-r-lg px-6 py-2 hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );
}
