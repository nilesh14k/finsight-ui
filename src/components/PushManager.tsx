"use client";
import { useEffect } from "react";
import axios from "axios";

export default function PushManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.register("/sw.js").then(async reg => {
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
      }
      await axios.post("/api/push/subscribe", sub, { withCredentials: true });
    });
  }, []);

  return null;
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const bin = atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
