"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  onCreated: () => void;
}

export default function WatchlistForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [symbolsInput, setSymbolsInput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const symbols = symbolsInput
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (!name || symbols.length === 0) {
      toast.error("Name & symbols required");
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        "/api/watchlists",
        { name, symbols },
        { withCredentials: true }
      );
      toast.success("Watchlist created");
      setName("");
      setSymbolsInput("");
      onCreated();
    } catch {
      toast.error("Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h4 className="text-lg font-semibold mb-2">New Watchlist</h4>
      <input
        type="text"
        placeholder="Name (e.g. Tech Stocks)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full text-sm border-b px-2 py-1 mb-3 focus:outline-none"
      />
      <input
        type="text"
        placeholder="Symbols, comma-separated"
        value={symbolsInput}
        onChange={(e) => setSymbolsInput(e.target.value)}
        className="w-full text-sm border-b px-2 py-1 mb-4 focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="w-full text-sm px-3 py-2 bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create"}
      </button>
    </div>
  );
}