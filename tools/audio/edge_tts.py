"""Microsoft Edge neural text-to-speech provider tool.

Uses the Edge Read Aloud endpoint via the ``edge-tts`` package. No API key and
no cost, but it is a network service — the models are Microsoft neural voices,
the same family Azure Speech exposes.
"""

from __future__ import annotations

import asyncio
import importlib.util
import time
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    RetryPolicy,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)


class EdgeTTS(BaseTool):
    name = "edge_tts"
    version = "0.1.0"
    tier = ToolTier.VOICE
    capability = "tts"
    provider = "edge"
    stability = ToolStability.BETA
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = []
    install_instructions = (
        "Install the edge-tts package:\n"
        "  pip install edge-tts\n"
        "No API key or account is required."
    )
    agent_skills = ["text-to-speech"]

    capabilities = [
        "text_to_speech",
        "voice_selection",
        "multilingual",
    ]
    supports = {
        "voice_cloning": False,
        "multilingual": True,
        "offline": False,
        "native_audio": True,
    }
    best_for = [
        "free natural-sounding neural narration without an API key",
        "Mandarin narration (zh-CN-YunxiNeural and friends)",
    ]
    not_good_for = [
        "fully offline production",
        "voice clone matching",
    ]

    input_schema = {
        "type": "object",
        "required": ["text"],
        "properties": {
            "text": {"type": "string"},
            "voice": {
                "type": "string",
                "default": "zh-CN-YunxiNeural",
                "description": "Neural voice name, e.g. zh-CN-YunxiNeural.",
            },
            "rate": {
                "type": "string",
                "default": "+0%",
                "description": "Speed delta as shown in the UI, e.g. '-10%'.",
            },
            "volume": {
                "type": "string",
                "default": "+0%",
            },
            "pitch": {
                "type": "string",
                "default": "+0Hz",
            },
            "output_path": {"type": "string"},
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=1, ram_mb=256, vram_mb=0, disk_mb=50, network_required=True
    )
    retry_policy = RetryPolicy(max_retries=2, retryable_errors=[])
    idempotency_key_fields = ["text", "voice", "rate", "pitch"]
    side_effects = ["writes audio file to output_path"]
    user_visible_verification = ["Listen to generated audio for intelligibility"]

    def get_status(self) -> ToolStatus:
        if importlib.util.find_spec("edge_tts") is not None:
            return ToolStatus.AVAILABLE
        return ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        if self.get_status() != ToolStatus.AVAILABLE:
            return ToolResult(success=False, error="Edge TTS not available. " + self.install_instructions)

        start = time.time()
        try:
            result = self._generate(inputs)
        except Exception as exc:
            return ToolResult(success=False, error=f"Edge TTS generation failed: {exc}")

        result.duration_seconds = round(time.time() - start, 2)
        return result

    def _generate(self, inputs: dict[str, Any]) -> ToolResult:
        import edge_tts

        output_path = Path(inputs.get("output_path", "tts_output.mp3"))
        output_path.parent.mkdir(parents=True, exist_ok=True)

        voice = inputs.get("voice", "zh-CN-YunxiNeural")
        rate = inputs.get("rate", "+0%")
        volume = inputs.get("volume", "+0%")
        pitch = inputs.get("pitch", "+0Hz")
        # edge-tts rejects bare "0%" — the value must carry an explicit sign.
        rate = rate if rate.startswith(("+", "-")) else f"+{rate}"
        volume = volume if volume.startswith(("+", "-")) else f"+{volume}"
        pitch = pitch if pitch.startswith(("+", "-")) else f"+{pitch}"

        async def _synthesize() -> None:
            communicate = edge_tts.Communicate(
                inputs["text"], voice, rate=rate, volume=volume, pitch=pitch
            )
            await communicate.save(str(output_path))

        asyncio.run(_synthesize())

        if not output_path.exists():
            return ToolResult(success=False, error=f"Edge TTS output file missing: {output_path}")

        return ToolResult(
            success=True,
            data={
                "provider": self.provider,
                "voice": voice,
                "rate": rate,
                "pitch": pitch,
                "text_length": len(inputs["text"]),
                "output": str(output_path),
                "format": "mp3",
            },
            artifacts=[str(output_path)],
            model=voice,
        )
