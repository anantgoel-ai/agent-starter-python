import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />

        {/* CTA Banner */}
        <section className={styles.ctaBanner} id="solutions">
          <div className="container">
            <div className={styles.ctaInner}>
              <div className={styles.ctaText}>
                <h2>Ready to experience the voice agent?</h2>
                <p>
                  Click below to start a live voice session. Make sure your Python backend is running first:
                  <code>python src/agent.py dev</code>
                </p>
              </div>
              <Link href="/agent" id="main-cta-btn" className="btn btn-demo" style={{fontSize: '1.1rem', padding: '16px 40px'}}>
                🎙️ Launch Voice Agent
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
