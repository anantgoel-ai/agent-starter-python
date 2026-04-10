import Link from "next/link";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero} id="home">
      {/* Background circuit pattern overlay */}
      <div className={styles.circuitOverlay} aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" opacity="0.12">
          <defs>
            <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M10 40 H30 M30 40 L30 20 M30 20 H50 M50 40 H70 M50 40 L50 60 M50 60 H70"
                stroke="white" strokeWidth="1" fill="none"/>
              <circle cx="30" cy="20" r="2" fill="white"/>
              <circle cx="50" cy="40" r="2" fill="white"/>
              <circle cx="50" cy="60" r="2" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Left: Text */}
        <div className={styles.textCol}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            AI-Powered Voice Intelligence
          </div>
          <h1 className={styles.headline}>
            Tailored AI Solutions to<br />
            <span className={styles.highlight}>Unlock Business Potential</span>
          </h1>
          <p className={styles.sub}>
            Converse naturally with our AI voice assistant — powered by Deepgram, GPT-4.1, and Cartesia.
            Real-time transcription, multilingual, zero latency.
          </p>
          <div className={styles.actions}>
            <Link href="/agent" id="hero-cta-voice" className="btn btn-ghost" style={{fontSize: '1rem', padding: '14px 36px'}}>
              🎙️ Start Voice Session
            </Link>
            <a href="#features" className="btn" style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(8px)'
            }}>
              Explore Features
            </a>
          </div>

          {/* Stats row */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>~50ms</strong>
              <span>Latency</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong>30+</strong>
              <span>Languages</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong>99.2%</strong>
              <span>Accuracy</span>
            </div>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className={styles.illustrationCol} aria-hidden="true">
          <div className={styles.orbRing1} />
          <div className={styles.orbRing2} />
          <div className={styles.orbRing3} />
          <div className={styles.heroOrb}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Microphone */}
              <rect x="28" y="12" width="24" height="36" rx="12" fill="white" opacity="0.9"/>
              <path d="M20 44c0 11.05 8.95 20 20 20s20-8.95 20-20" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <line x1="40" y1="64" x2="40" y2="72" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="30" y1="72" x2="50" y2="72" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              {/* Sound waves */}
              <path d="M14 35 Q10 40 14 45" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M8 30 Q2 40 8 50" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
              <path d="M66 35 Q70 40 66 45" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M72 30 Q78 40 72 50" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
            </svg>
          </div>

          {/* Floating cards */}
          <div className={`${styles.floatCard} ${styles.floatCard1}`}>
            <span className={styles.floatIcon}>🧠</span>
            <div>
              <div className={styles.floatLabel}>GPT-4.1 Mini</div>
              <div className={styles.floatSub}>LLM Brain</div>
            </div>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCard2}`}>
            <span className={styles.floatIcon}>🎯</span>
            <div>
              <div className={styles.floatLabel}>Deepgram Nova-3</div>
              <div className={styles.floatSub}>STT Engine</div>
            </div>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCard3}`}>
            <span className={styles.floatIcon}>🔊</span>
            <div>
              <div className={styles.floatLabel}>Cartesia Sonic-3</div>
              <div className={styles.floatSub}>Voice Synthesis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollDot} />
        <div className={styles.scrollDot} />
        <div className={styles.scrollDot} />
        <div className={styles.scrollDot} />
      </div>
    </section>
  );
}
