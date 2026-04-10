import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <polygon points="20,2 38,36 2,36" fill="none" stroke="#59e1d1" strokeWidth="2.5"/>
              <polygon points="20,8 34,34 6,34" fill="#59e1d1" opacity="0.3"/>
              <polygon points="12,18 28,18 20,34" fill="#f47d53" opacity="0.8"/>
              <circle cx="20" cy="14" r="4" fill="#fff"/>
            </svg>
            <div>
              <div className={styles.logoName}>INSIGHTS CURRY</div>
              <div className={styles.logoTagline}>SIMPLIFYING DECISION</div>
            </div>
          </Link>
          <p className={styles.desc}>
            Conversational AI voice agents built for decision-makers.<br />
            Real-time intelligence, zero friction.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linksCol}>
            <h4>Product</h4>
            <Link href="/agent">Voice Agent</Link>
            <a href="#features">Features</a>
            <a href="#solutions">Solutions</a>
          </div>
          <div className={styles.linksCol}>
            <h4>Company</h4>
            <a href="https://www.insightscurry.com/" target="_blank" rel="noopener noreferrer">About</a>
            <a href="https://www.insightscurry.com/" target="_blank" rel="noopener noreferrer">Contact</a>
          </div>
          <div className={styles.linksCol}>
            <h4>Technology</h4>
            <a href="https://livekit.io" target="_blank" rel="noopener noreferrer">LiveKit</a>
            <a href="https://deepgram.com" target="_blank" rel="noopener noreferrer">Deepgram</a>
            <a href="https://cartesia.ai" target="_blank" rel="noopener noreferrer">Cartesia</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© {new Date().getFullYear()} Insights Curry. All rights reserved.</span>
          <span className={styles.powered}>Powered by LiveKit Cloud + Deepgram + Cartesia + GPT-4.1</span>
        </div>
      </div>
    </footer>
  );
}
