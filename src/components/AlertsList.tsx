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
  const prevRef = useRef<AlertItem[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchAlerts = async () => {
      try {
        const res = await axios.get<AlertItem[]>("/api/alerts", {
          withCredentials: true,
        });
        const newAlerts = res.data;
        newAlerts.forEach((a) => {
          const prev = prevRef.current.find((x) => x.id === a.id);
          if (a.triggered && prev && !prev.triggered) {
            toast.success(
              `${a.symbol} ${a.condition} $${a.targetPrice.toFixed(2)} triggered!`
            );
          }
        });
        setAlerts(newAlerts);
        prevRef.current = newAlerts;
      } catch {
        toast.error("Could not load alerts.");
      }
    };
    fetchAlerts();
    const id = setInterval(fetchAlerts, 30000);
    return () => clearInterval(id);
  }, [status]);

  if (status === "loading")
    return <p className="text-center py-2">Loading alerts…</p>;

  if (!session || alerts.length === 0)
    return (
      <p className="text-center text-gray-600 py-2">No alerts yet.</p>
    );

  return (
    <div className="w-full max-w-md mx-auto">
      <h4 className="text-lg font-semibold mb-2">Your Alerts</h4>
      <div className="max-h-96 overflow-auto">
        <ul className="divide-y">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="py-2 flex justify-between items-center text-sm"
            >
              <div>
                <span className="font-medium">{a.symbol}</span>{" "}
                <span className="text-gray-700">
                  {a.condition} ${a.targetPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{new Date(a.createdAt).toLocaleDateString()}</div>
                <div
                  className={
                    a.triggered ? "text-red-600" : "text-green-600"
                  }
                >
                  {a.triggered ? "Triggered" : "Pending"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
