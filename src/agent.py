import logging
import os

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    room_io,
)
from livekit.plugins import noise_cancellation, silero, openai, google
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor.""",
        )

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    ai_provider = os.getenv("AI_PROVIDER", "openai").lower()
    
    if ai_provider == "googlelive":
        # Google Live API evaluates speech-to-speech directly without separate STT/TTS models
        session = AgentSession(
            llm=google.beta.realtime.RealtimeModel()
        )
    else:
        # 1. Use Deepgram for extremely fast, streaming STT to keep the UI transcripts buttery smooth
        stt = inference.STT(model="deepgram/nova-3", language="multi")

        if ai_provider == "google":
            llm = google.LLM()
            # Google TTS require Google Cloud Application Default Credentials (ADC).
            # If they are not configured, we gracefully fall back to OpenAI for TTS.
            try:
                tts = google.TTS()
            except ValueError as e:
                logger.warning(f"Google Cloud credentials not found, falling back to OpenAI for TTS: {e}")
                tts = openai.TTS()
        else:
            llm = openai.LLM()
            tts = openai.TTS()

        # Set up a voice AI pipeline using either OpenAI or Google (configured via AI_PROVIDER)
        session = AgentSession(
            allow_interruptions=True,
            # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
            stt=stt,
            # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
            llm=llm,
            # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
            tts=tts,
            # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
            # See more at https://docs.livekit.io/agents/build/turns
            turn_detection=MultilingualModel(),
            vad=ctx.proc.userdata["vad"],
            # allow the LLM to generate a response while waiting for the end of turn
            # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
            preemptive_generation=True,
        )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
