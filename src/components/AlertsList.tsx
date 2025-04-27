// src/components/AlertsList.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface AlertItem {
  id: string;
  symbol: string;
  condition: "above" | "below";
  targetPrice: number;
  triggered: boolean;
  createdAt: string;
}

export default function AlertsList() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prevAlertsRef = useRef<AlertItem[]>([]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get<AlertItem[]>("/api/alerts", { withCredentials: true });
      const newAlerts = res.data;

      newAlerts.forEach((a) => {
        const prev = prevAlertsRef.current.find((x) => x.id === a.id);
        if (a.triggered && prev && !prev.triggered) {
          toast.success(
            `${a.symbol} ${a.condition} $${a.targetPrice.toFixed(2)} triggered!`
          );
        }
      });

      setAlerts(newAlerts);
      prevAlertsRef.current = newAlerts;
    } catch (err) {
      console.error(err);
      setError("Could not load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 30_000);
    return () => clearInterval(interval);
  }, [status]);

  if (status === "loading" || loading) {
    return <p className="text-center p-4">Loading your alerts…</p>;
  }
  if (!session) return null;
  if (error) return <p className="text-red-600 text-center">{error}</p>;
  if (alerts.length === 0) {
    return <p className="text-center text-gray-600">You have no alerts yet.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      <h4 className="text-lg font-semibold mb-2">Your Alerts</h4>
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className="flex justify-between bg-white p-3 rounded-lg shadow"
          >
            <div>
              <span className="font-medium">{a.symbol}</span>{" "}
              <span className="text-sm text-gray-600">
                {a.condition} ${a.targetPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-right text-xs text-gray-500">
              {new Date(a.createdAt).toLocaleDateString()}{" "}
              {a.triggered ? (
                <span className="text-red-500">🚨 Triggered</span>
              ) : (
                <span className="text-green-500">⏳ Pending</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
