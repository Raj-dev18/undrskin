'use client';

import React, { useState, useEffect } from 'react';

const MESSAGES = [
  'COMPLIMENTARY WORLDWIDE DELIVERY ON ORDERS OVER $150',
  'ARCHITECTURAL MINIMALISM — CRAFTED FOR EVERY BODY',
  'ORGANIC OEKO-TEX® CERTIFIED SECOND-SKIN FABRICS',
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-300 text-[11px] uppercase tracking-[0.2em] py-2 px-4 text-center font-medium overflow-hidden transition-all">
      <span className="inline-block transition-opacity duration-500 ease-in-out">
        {MESSAGES[index]}
      </span>
    </div>
  );
}
