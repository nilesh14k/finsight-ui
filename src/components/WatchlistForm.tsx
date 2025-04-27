"use client";
import { useState } from "react";
import axios from "axios";

interface Props {
  onCreated: () => void;
}

export default function WatchlistForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [symbolsInput, setSymbolsInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const symbols = symbolsInput
      .split(",")
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    if (!name || symbols.length === 0) {
      setError("Please provide a name and at least one symbol.");
      return;
    }
    try {
      await axios.post(
        "/api/watchlists",
        { name, symbols },
        { withCredentials: true }
      );
      setName("");
      setSymbolsInput("");
      onCreated();
    } catch (err) {
      console.error(err);
      setError("Could not create watchlist.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
      <h4 className="font-semibold mb-2">New Watchlist</h4>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        type="text"
        placeholder="Name (e.g. Tech Stocks)"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border rounded px-4 py-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Symbols, comma-separated"
        value={symbolsInput}
        onChange={e => setSymbolsInput(e.target.value)}
        className="border rounded px-4 py-2 mb-4 w-full"
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Create
      </button>
    </div>
  );
}
