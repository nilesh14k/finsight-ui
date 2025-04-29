"use client";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";

export default function NavBar() {
  const router = useRouter();

  const onSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
      if (val) router.push(`/stocks/${val}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => router.push("/")}
        >
          StockTracker
        </h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search AAPL"
            onKeyDown={onSearch}
            className="border rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
          />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
