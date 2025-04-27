"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
}

interface Props {
  onLoad: (symbols: string[]) => void;
}

export default function WatchlistList({ onLoad }: Props) {
  const [lists, setLists] = useState<Watchlist[]>([]);

  const fetchLists = async () => {
    const res = await axios.get<Watchlist[]>("/api/watchlists", { withCredentials: true });
    setLists(res.data);
  };

  const handleDelete = async (id: string) => {
    await axios.delete("/api/watchlists", {
      data: { id },
      withCredentials: true,
    });
    fetchLists();
  };

  useEffect(() => {
    fetchLists();
  }, []);

  if (lists.length === 0) {
    return <p className="text-center text-gray-600 mt-4">No watchlists yet.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-6 space-y-2">
      <h4 className="font-semibold mb-2">Your Watchlists</h4>
      {lists.map(wl => (
        <div
          key={wl.id}
          className="bg-white p-3 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <strong>{wl.name}</strong>
            <div className="text-sm text-gray-600">
              {wl.symbols.join(", ")}
            </div>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onLoad(wl.symbols)}
              className="text-blue-600 hover:underline text-sm"
            >
              Load
            </button>
            <button
              onClick={() => handleDelete(wl.id)}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
