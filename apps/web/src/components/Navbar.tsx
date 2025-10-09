'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="container">
        <div className="flex items-center justify-between">
          <Link href="/" className="navbar-brand">
            Jp7an-timing
          </Link>
          
          {!isAdmin && (
            <ul className="navbar-nav">
              <li>
                <Link href="/" className="navbar-link">
                  Hem
                </Link>
              </li>
              <li>
                <Link href="/anmalan" className="navbar-link">
                  Anmälan
                </Link>
              </li>
              <li>
                <Link href="/chiputlamning" className="navbar-link">
                  Chiputlämning
                </Link>
              </li>
              <li>
                <Link href="/admin" className="navbar-link">
                  Admin
                </Link>
              </li>
            </ul>
          )}
          
          {isAdmin && (
            <ul className="navbar-nav">
              <li>
                <Link href="/admin" className="navbar-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/" className="navbar-link">
                  Till webbplatsen
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
