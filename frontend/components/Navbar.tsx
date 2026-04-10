"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="20,2 38,36 2,36" fill="none" stroke="#2062ad" strokeWidth="2.5"/>
            <polygon points="20,8 34,34 6,34" fill="#59e1d1" opacity="0.5"/>
            <polygon points="12,18 28,18 20,34" fill="#f47d53" opacity="0.8"/>
            <circle cx="20" cy="14" r="4" fill="#3a4cb7"/>
            <polygon points="8,36 20,18 20,36" fill="#f8b946" opacity="0.7"/>
          </svg>
          <div className={styles.logoText}>
            <span className={styles.logoName}>INSIGHTS CURRY</span>
            <span className={styles.logoTagline}>SIMPLIFYING DECISION</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className={styles.links}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="#features">Platform</Link></li>
          <li><Link href="#solutions">Solutions</Link></li>
          <li><Link href="/agent">Voice Agent</Link></li>
        </ul>

        {/* CTA Buttons */}
        <div className={styles.ctas}>
          <Link href="/agent" className="btn btn-primary">
            Try Voice Agent
          </Link>
          <a
            href="https://www.insightscurry.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-demo"
          >
            Ask for a Demo
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="hamburger-btn"
        >
          <span className={menuOpen ? styles.barActive : styles.bar} />
          <span className={menuOpen ? styles.barMid : styles.bar} />
          <span className={menuOpen ? styles.barActive : styles.bar} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="#features" onClick={() => setMenuOpen(false)}>Platform</Link>
          <Link href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</Link>
          <Link href="/agent" onClick={() => setMenuOpen(false)}>Voice Agent</Link>
          <Link href="/agent" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
            Try Voice Agent
          </Link>
        </div>
      )}
    </nav>
  );
}
