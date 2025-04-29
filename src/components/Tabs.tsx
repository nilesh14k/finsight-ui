"use client";

import { ReactNode, useState } from "react";

interface TabsProps {
  tabs: string[];
  children: ReactNode[];
}

export default function Tabs({ tabs, children }: TabsProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full max-w-lg mx-auto text-sm text-gray-700">
      <div className="flex border-b">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`px-3 py-2 -mb-px focus:outline-none ${
              active === i
                ? "border-b-2 border-blue-600 font-medium"
                : "opacity-60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {children[active]}
      </div>
    </div>
  );
}
