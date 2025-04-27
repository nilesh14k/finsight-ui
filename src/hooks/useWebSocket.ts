// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from "react";

export function useWebSocket<T>(url?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    wsRef.current?.close();

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        setData(JSON.parse(evt.data));
      } catch {
        setError("Invalid JSON");
      }
    };
    ws.onerror = () => setError("WebSocket error");

    return () => {
      ws.close();
    };
  }, [url]);

  return { data, error };
}
