"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
    try {
      const res = await axios.get<Watchlist[]>("/api/watchlists", {
        withCredentials: true,
      });
      setLists(res.data);
    } catch {
      toast.error("Could not load watchlists.");
    }
  };

  const del = async (id: string) => {
    try {
      await axios.delete("/api/watchlists", {
        data: { id },
        withCredentials: true,
      });
      toast.success("Deleted");
      fetchLists();
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  if (lists.length === 0) {
    return (
      <p className="text-center text-gray-600 py-2">
        No watchlists yet.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h4 className="text-lg font-semibold mb-2">Your Watchlists</h4>
      <div className="max-h-96 overflow-auto">
        <ul className="divide-y">
          {lists.map((wl) => (
            <li
              key={wl.id}
              className="py-2 flex justify-between items-center text-sm"
            >
              <div>
                <div className="font-medium">{wl.name}</div>
                <div className="text-gray-700">
                  {wl.symbols.join(", ")}
                </div>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => onLoad(wl.symbols)}
                  className="text-blue-600 hover:underline"
                >
                  Load
                </button>
                <button
                  onClick={() => del(wl.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
