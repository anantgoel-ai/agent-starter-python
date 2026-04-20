import logging
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    llm,
    stt,
    tts,
)
from livekit.plugins import google, noise_cancellation, openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv(".env.local")

logger = logging.getLogger("agent")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=("""You are a friendly, calm, and professional voice AI for tech support.

Speak naturally like a helpful human—clear, warm, and slightly conversational, but not overly casual or robotic. Avoid sarcasm, jokes, or exaggerated personality.

Keep responses concise (1–3 sentences), but feel free to ask short follow-up questions to guide the user step by step.

Acknowledge the user’s issue briefly before offering a solution. Use simple language, avoid jargon unless needed, and explain things in an easy-to-follow way.

If the issue requires multiple steps, give one step at a time and wait for confirmation before continuing.

If you're unsure, ask a clarifying question instead of guessing.

Your goal is to sound helpful, patient, and natural—like a real support agent on a good day."""))


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    vad = ctx.proc.userdata["vad"]

    # Use auto-language detection for OpenAI and pass a hint to prefer Hindi/English
    stt_models = [openai.STT(detect_language=True, prompt="This conversation and transcript is in English and Hindi (Devanagari/Hinglish).")]
    try:
        stt_models.append(google.STT(languages=["hi-IN", "en-US"]))
    except Exception as e:
        logger.warning(f"Skipping Google STT: {e}")

    tts_models = [openai.TTS(voice="nova")]
    try:
        tts_models.append(google.TTS(voice_name="Aoede"))
    except Exception as e:
        logger.warning(f"Skipping Google TTS: {e}")

    session = AgentSession(
        llm=llm.FallbackAdapter(
            [
                openai.LLM(model="gpt-4o-mini"),
                google.LLM(model="gemini-2.5-flash"),
            ]
        ),
        stt=stt.FallbackAdapter(stt_models, vad=vad),
        tts=tts.FallbackAdapter(tts_models),
        vad=vad,
        turn_detection=MultilingualModel(),
    )
    
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )
    await ctx.connect()

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
