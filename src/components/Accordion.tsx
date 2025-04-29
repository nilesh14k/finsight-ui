// src/components/Accordion.tsx
"use client";
import { useState, ReactNode } from "react";

interface AccordionProps { title: string; children: ReactNode }

export default function Accordion({ title, children }: AccordionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center bg-gray-100 px-4 py-2 rounded-md"
      >
        <span className="text-base font-medium text-gray-900">{title}</span>
        <span className="text-gray-500">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}
