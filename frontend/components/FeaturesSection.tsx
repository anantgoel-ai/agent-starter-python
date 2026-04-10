import styles from "./FeaturesSection.module.css";

const features = [
  {
    icon: "⚡",
    title: "Ultra-Low Latency",
    description: "Sub-50ms voice pipeline with preemptive generation so responses feel instant.",
  },
  {
    icon: "🌍",
    title: "Multilingual Support",
    description: "Deepgram Nova-3 detects and transcribes 30+ languages in real time.",
  },
  {
    icon: "🧠",
    title: "GPT-4.1 Intelligence",
    description: "Powered by OpenAI's latest model — concise, accurate, and contextually aware.",
  },
  {
    icon: "🔊",
    title: "Natural Voice Synthesis",
    description: "Cartesia Sonic-3 delivers expressive, human-like speech with ultra-low TTS latency.",
  },
  {
    icon: "🛡️",
    title: "Noise Cancellation",
    description: "Built-in BVC noise cancellation removes background sounds for crystal-clear audio.",
  },
  {
    icon: "📊",
    title: "Live Transcription",
    description: "Real-time transcript display as you speak — full conversation history visible.",
  },
  {
    icon: "🔐",
    title: "Secure by Design",
    description: "JWT-authenticated sessions, credentials never reach the browser.",
  },
  {
    icon: "🚀",
    title: "LiveKit Cloud",
    description: "Built on LiveKit's global WebRTC infrastructure for reliable, worldwide access.",
  },
];

export default function FeaturesSection() {
  return (
    <section className={styles.section} id="features">
      <div className="container">
        <h2 className="section-title">Why Insights Curry Voice AI?</h2>
        <p className="section-subtitle">
          An enterprise-grade voice agent stack built for speed, accuracy, and reliability.
        </p>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <div key={i} className={styles.card} id={`feature-card-${i}`}>
              <div className={styles.iconWrap}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
