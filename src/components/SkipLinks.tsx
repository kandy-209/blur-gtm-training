'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SkipLinks() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip links when Tab is pressed
      if (e.key === 'Tab' && !isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Hide skip links when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClick = () => setIsVisible(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible]);

  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '/scenarios', label: 'Skip to scenarios' },
    { href: '/analytics', label: 'Skip to analytics' },
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 z-[110] w-full bg-black text-white p-2 shadow-lg">
      <nav aria-label="Skip links">
        <ul className="flex flex-wrap gap-4 justify-center">
          {skipLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-colors"
                onClick={() => setIsVisible(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

