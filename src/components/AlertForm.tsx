"use client";
import { useState } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import toast from "react-hot-toast";

interface AlertFormProps {
  defaultSymbol?: string;
}

export default function AlertForm({ defaultSymbol = "" }: AlertFormProps) {
  const { data: session, status } = useSession();
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState<number | "">("");

  if (status === "loading") {
    return <p className="text-center py-2">Checking authentication…</p>;
  }

  if (!session) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-4">
        <p className="mb-2 text-sm">Sign in to set price alerts.</p>
        <button
          onClick={() => signIn()}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white"
        >
          Sign in
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      await axios.post(
        "/api/alerts",
        { symbol: symbol.toUpperCase(), condition, targetPrice },
        { withCredentials: true }
      );
      toast.success(`Alert set: ${symbol} ${condition} $${targetPrice}`);
      setSymbol("");
      setCondition("above");
      setTargetPrice("");
    } catch {
      toast.error("Failed to create alert.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-2">New Price Alert</h3>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-4">
        <input
          type="text"
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="border-b px-2 py-1 text-sm focus:outline-none"
        />
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCondition("above")}
            className={`text-xs px-2 py-1 ${
              condition === "above" ? "border-b-2" : "opacity-60"
            }"`}
          >
            Above
          </button>
          <button
            onClick={() => setCondition("below")}
            className={`text-xs px-2 py-1 ${
              condition === "below" ? "border-b-2" : "opacity-60"
            }"`}
          >
            Below
          </button>
        </div>
        <input
          type="number"
          placeholder="Price"
          value={targetPrice}
          onChange={(e) =>
            setTargetPrice(e.target.value ? Number(e.target.value) : "")
          }
          className="border-b px-2 py-1 text-sm focus:outline-none"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!symbol || !targetPrice}
        className="w-full text-sm px-3 py-2 bg-green-600 text-white disabled:opacity-50"
      >
        Set Alert
      </button>
    </div>
  );
}