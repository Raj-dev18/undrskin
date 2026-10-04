'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MESSAGES = [
  'SKIN-FIRST COMFORT IN EVERY LAYER',
  'BAMBOO ESSENTIALS, MADE FOR EVERYDAY MOVEMENT',
  'COMPLIMENTARY EXPRESS DELIVERY ACROSS INDIA',
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (pathname === '/') {
    return null;
  }

  return (
    <div className="announcement-bar bg-[#EAD9C8] border-b border-[#D7C4B2] text-[#392D29] text-[11px] uppercase tracking-[0.2em] py-2 px-4 text-center font-medium overflow-hidden transition-all">
      <span className="inline-block transition-opacity duration-500 ease-in-out">
        {MESSAGES[index]}
      </span>
    </div>
  );
}
