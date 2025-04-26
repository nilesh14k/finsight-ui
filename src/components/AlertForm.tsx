"use client";
import { useState } from "react";
import axios from "axios";

interface AlertFormProps {
  defaultSymbol?: string;
}

export default function AlertForm({ defaultSymbol = "" }: AlertFormProps) {
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState<number | "">("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/alerts`, {
        symbol,
        condition,
        target_price: targetPrice,
      });
      setSuccess(`Alert set for ${symbol} ${condition} ${targetPrice}`);
      setSymbol(defaultSymbol);
      setCondition("above");
      setTargetPrice("");
    } catch (error) {
      console.error(error);
      setSuccess(null);
      alert("Failed to create alert.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Set Price Alert</h3>
      <input
        type="text"
        placeholder="Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        className="border rounded px-4 py-2 mb-3 w-full focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex mb-3">
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as any)}
          className="border rounded-l px-4 py-2"
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input
          type="number"
          placeholder="Price"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : "")}
          className="border rounded-r px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!symbol || !targetPrice}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        Set Alert
      </button>
      {success && <p className="mt-3 text-green-600">{success}</p>}
    </div>
  );
}