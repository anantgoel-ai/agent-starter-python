"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  ConnectionState,
  createLocalAudioTrack,
  LocalAudioTrack,
  Participant,
  TrackEvent,
} from "livekit-client";
import Navbar from "@/components/Navbar";
import styles from "./agent.module.css";

type AgentStatus = "idle" | "connecting" | "connected" | "listening" | "speaking" | "error" | "ended";

interface TranscriptEntry {
  id: string;
  speaker: "user" | "agent";
  text: string;
  timestamp: Date;
}

export default function AgentPage() {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalAudioTrack | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Session timer
  useEffect(() => {
    if (status === "connected" || status === "listening" || status === "speaking") {
      if (!startTimeRef.current) startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setSessionDuration(Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000));
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const addTranscript = useCallback((speaker: "user" | "agent", text: string) => {
    setTranscript((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, speaker, text, timestamp: new Date() },
    ]);
  }, []);

  const startSession = useCallback(async () => {
    setStatus("connecting");
    setErrorMsg(null);

    try {
      // 1. Get token from our API
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: `insights-curry-${Date.now()}`,
          participantName: `user-${Date.now()}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to get access token");
      const { token, url } = await res.json();

      // 2. Create LiveKit room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      roomRef.current = room;

      // 3. Handle agent audio (subscribe to agent track)
      room.on(RoomEvent.TrackSubscribed, (track, pub, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          const audioEl = track.attach();
          audioEl.play().catch(() => {});
          document.body.appendChild(audioEl);

          // Detect agent speaking via audio level
          track.on(TrackEvent.AudioPlaybackStarted, () => setAgentSpeaking(true));
          track.on(TrackEvent.AudioPlaybackFailed, () => setAgentSpeaking(false));
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, () => setAgentSpeaking(false));

      // 4. Handle real-time transcription events
      // LiveKit delivers transcription segments via the built-in TranscriptionReceived event.
      room.on(
        RoomEvent.TranscriptionReceived,
        (segments, participant) => {
          for (const segment of segments) {
            if (!segment.final) continue;
            const speaker = participant?.isAgent ? "agent" : "user";
            addTranscript(speaker, segment.text);
          }
        }
      );

      // 5. Handle data messages for any custom payloads or agent signals
      room.on(RoomEvent.DataReceived, (data: Uint8Array, participant?: RemoteParticipant) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(data));
          if (msg.type === "agent_speech_started") setAgentSpeaking(true);
          if (msg.type === "agent_speech_finished") setAgentSpeaking(false);
        } catch {}
      });

      // 6. Connection state changes
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) setStatus("connected");
        if (state === ConnectionState.Disconnected) setStatus("ended");
        if (state === ConnectionState.Reconnecting) setStatus("connecting");
      });

      // 6. Participant events
      room.on(RoomEvent.ParticipantConnected, (p: Participant) => {
        if (p.isAgent) {
          addTranscript("agent", "Hello! I'm your Insights Curry AI assistant. How can I help you today?");
          setStatus("listening");
        }
      });

      // 7. Connect
      await room.connect(url, token);
      setStatus("connected");

      // 8. Publish local microphone
      const audioTrack = await createLocalAudioTrack({ echoCancellation: true, noiseSuppression: true });
      localTrackRef.current = audioTrack;
      await room.localParticipant.publishTrack(audioTrack);
      setStatus("listening");

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Connection failed");
      setStatus("error");
    }
  }, [addTranscript]);

  const endSession = useCallback(async () => {
    if (localTrackRef.current) {
      localTrackRef.current.stop();
    }
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    // Clean up any audio elements
    document.querySelectorAll("audio").forEach((el) => el.remove());
    setStatus("ended");
    setAgentSpeaking(false);
  }, []);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;
    const muted = !isMuted;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!muted);
    setIsMuted(muted);
  }, [isMuted]);

  const statusConfig: Record<AgentStatus, { label: string; color: string; dot: string }> = {
    idle: { label: "Ready to connect", color: "#5a7099", dot: "#eceff1" },
    connecting: { label: "Connecting...", color: "#f8b946", dot: "#f8b946" },
    connected: { label: "Connected", color: "#59e1d1", dot: "#59e1d1" },
    listening: { label: "Listening", color: "#59e1d1", dot: "#59e1d1" },
    speaking: { label: "Agent speaking", color: "#3a4cb7", dot: "#3a4cb7" },
    error: { label: "Error", color: "#f47d53", dot: "#f47d53" },
    ended: { label: "Session ended", color: "#5a7099", dot: "#eceff1" },
  };

  const sc = statusConfig[status];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.layout}`}>
          {/* ── Left Panel: Voice Orb ── */}
          <div className={styles.orbPanel}>
            <div className={styles.sessionHeader}>
              <h1 className={styles.sessionTitle}>Voice Session</h1>
              <div className={styles.statusBadge} style={{ borderColor: sc.dot }}>
                <span className={styles.statusDot} style={{ background: sc.dot,
                  boxShadow: status === "listening" || status === "connected" ? `0 0 8px ${sc.dot}` : "none",
                  animation: status === "connecting" ? "blink 1s infinite" : status === "listening" ? "pulseDot 2s infinite" : "none"
                }} />
                <span style={{ color: sc.color }}>{sc.label}</span>
              </div>
            </div>

            {/* Orb */}
            <div className={styles.orbContainer}>
              <div className={`${styles.orbRing} ${agentSpeaking ? styles.orbRingActive : ""}`} />
              <div className={`${styles.orbRing2} ${agentSpeaking ? styles.orbRing2Active : ""}`} />
              <div className={`${styles.orb} ${agentSpeaking ? styles.orbSpeaking : ""} ${status === "listening" ? styles.orbListening : ""}`}>
                {status === "connecting" ? (
                  <div className={styles.spinner} />
                ) : status === "idle" || status === "ended" || status === "error" ? (
                  <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
                    <rect x="28" y="12" width="24" height="36" rx="12" fill="white" opacity="0.9"/>
                    <path d="M20 44c0 11.05 8.95 20 20 20s20-8.95 20-20" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    <line x1="40" y1="64" x2="40" y2="72" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="30" y1="72" x2="50" y2="72" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                ) : agentSpeaking ? (
                  <div className={styles.speakingWave}>
                    {[1,2,3,4,5].map(i => <div key={i} className={styles.wavebar} style={{animationDelay: `${i*0.1}s`}} />)}
                  </div>
                ) : (
                  <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
                    <rect x="28" y="12" width="24" height="36" rx="12" fill="white" opacity="0.9"/>
                    <path d="M20 44c0 11.05 8.95 20 20 20s20-8.95 20-20" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    <line x1="40" y1="64" x2="40" y2="72" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="30" y1="72" x2="50" y2="72" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M14 35 Q10 40 14 45" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
                    <path d="M66 35 Q70 40 66 45" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Timer */}
            {(status === "connected" || status === "listening" || status === "speaking") && (
              <div className={styles.timer}>{formatDuration(sessionDuration)}</div>
            )}

            {/* Error */}
            {status === "error" && errorMsg && (
              <div className={styles.errorBox}>
                <strong>Connection Error</strong>
                <p>{errorMsg}</p>
                <p className={styles.errorHint}>Make sure <code>python src/agent.py dev</code> is running.</p>
              </div>
            )}

            {/* Controls */}
            <div className={styles.controls}>
              {status === "idle" || status === "ended" || status === "error" ? (
                <button id="start-btn" className={`btn btn-primary ${styles.ctaBtn}`} onClick={startSession}>
                  🎙️ {status === "ended" ? "Start New Session" : "Start Voice Session"}
                </button>
              ) : status === "connecting" ? (
                <button className={`btn ${styles.ctaBtn}`} disabled style={{background: '#ccc', cursor: 'not-allowed'}}>
                  Connecting...
                </button>
              ) : (
                <div className={styles.sessionControls}>
                  <button
                    id="mute-btn"
                    className={`btn ${isMuted ? styles.muteActive : styles.muteBtn}`}
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? "🔇 Unmute" : "🎙️ Mute"}
                  </button>
                  <button id="end-btn" className={`btn ${styles.endBtn}`} onClick={endSession}>
                    ⏹ End Session
                  </button>
                </div>
              )}
            </div>

            {/* Back link */}
            <Link href="/" className={styles.backLink}>← Back to Home</Link>
          </div>

          {/* ── Right Panel: Transcript ── */}
          <div className={styles.transcriptPanel}>
            <div className={styles.transcriptHeader}>
              <h2>Live Transcript</h2>
              {transcript.length > 0 && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setTranscript([])}
                  id="clear-transcript-btn"
                >
                  Clear
                </button>
              )}
            </div>

            <div className={styles.transcriptBody} id="transcript-body">
              {transcript.length === 0 ? (
                <div className={styles.transcriptEmpty}>
                  <div className={styles.emptyIcon}>💬</div>
                  <p>Transcript will appear here once you start a session and speak.</p>
                </div>
              ) : (
                transcript.map((entry) => (
                  <div key={entry.id} className={`${styles.bubble} ${entry.speaker === "agent" ? styles.agentBubble : styles.userBubble}`}>
                    <div className={styles.bubbleLabel}>
                      {entry.speaker === "agent" ? "🤖 AI Assistant" : "👤 You"}
                      <span className={styles.bubbleTime}>
                        {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    <p className={styles.bubbleText}>{entry.text}</p>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Model info footer */}
            <div className={styles.modelInfo}>
              <span title="Speech to Text">🎙️ Deepgram Nova-3</span>
              <span>→</span>
              <span title="Large Language Model">🧠 GPT-4.1 Mini</span>
              <span>→</span>
              <span title="Text to Speech">🔊 Cartesia Sonic-3</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
