from __future__ import annotations

import json
import csv
from io import StringIO
from typing import Any, Dict, Optional
from langchain.chains import SequentialChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from backend.chains.analysis_chain import build_analysis_chain
from backend.chains.insight_chain import build_insight_chain
from backend.chains.recommendation_chain import build_recommendation_chain


class ReasoningEngineConfig(BaseModel):
    """
    Configuration for the reasoning engine.
    """

    model: str = "gpt-4o-mini"
    temperature: float = 0.2


class ReasoningEngine:
    """
    Orchestrates the 3-step reasoning chain over merchant data.

    The engine:
    1) Parses incoming merchant data (CSV or JSON).
    2) Creates a compact textual snapshot for the LLM.
    3) Runs a SequentialChain of three LangChain LLMChains:
       - analysis
       - insight
       - recommendation
    4) Uses ConversationBufferMemory to keep session context across calls.
    """

    def __init__(self, config: Optional[ReasoningEngineConfig] = None) -> None:
        self.config = config or ReasoningEngineConfig()

        # Shared chat model instance so the entire chain uses a consistent configuration.
        self.llm = ChatOpenAI(
            model=self.config.model,
            temperature=self.config.temperature,
        )

        # Memory keeps prior conversation history so that multiple /analyze calls
        # can build on each other in a single session.
        self.memory = ConversationBufferMemory(
        memory_key="conversation_history",
        return_messages=True,
        output_key="analysis"
        )

        # Individual step chains.
        analysis_chain = build_analysis_chain(self.llm)
        insight_chain = build_insight_chain(self.llm)
        recommendation_chain = build_recommendation_chain(self.llm)

        # Sequential pipeline with explicit input/output mapping between steps.
        self.pipeline = SequentialChain(
            chains=[analysis_chain, insight_chain, recommendation_chain],
            input_variables=["structured_merchant_snapshot"],
            output_variables=["analysis", "insight", "recommendation"],
            memory=self.memory,
            verbose=True,
        )

    def _snapshot_from_json(self, raw: str) -> str:
        """
        Convert raw JSON text into a compact human-readable description.
        """
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            # If JSON is invalid, still pass something useful to the LLM.
            return f"Unparseable JSON payload. Raw body:\n{raw[:4000]}"

        # Keep the transformation intentionally simple and robust.
        if isinstance(obj, list):
            preview = obj[:5]
            return (
                f"JSON array with {len(obj)} records. "
                f"Preview of first records:\n{json.dumps(preview, indent=2)[:4000]}"
            )
        elif isinstance(obj, dict):
            return f"JSON object with keys {list(obj.keys())}. Body:\n{json.dumps(obj, indent=2)[:4000]}"
        else:
            return f"JSON value of type {type(obj).__name__}: {repr(obj)[:4000]}"

    def _snapshot_from_csv(self, raw: str) -> str:
        """
        Convert raw CSV text into a concise table summary without heavy dependencies.
        """
        buffer = StringIO(raw)
        reader = csv.reader(buffer)

        try:
            rows = list(reader)
        except Exception:
            return f"Unparseable CSV payload. Raw body:\n{raw[:4000]}"

        if not rows:
            return "Empty CSV file."

        header = rows[0]
        data_rows = rows[1:]

        total_rows = len(data_rows)
        total_cols = len(header)

        # Build a small preview table (up to 5 data rows).
        preview_rows = data_rows[:5]
        preview_lines = [", ".join(header)]
        for r in preview_rows:
            preview_lines.append(", ".join(r))
        preview_text = "\n".join(preview_lines)

        return (
            "CSV dataset snapshot\n"
            f"Rows (excluding header): {total_rows}, Columns: {total_cols}\n"
            f"Columns: {header}\n\n"
            "First rows (comma-separated):\n"
            f"{preview_text}"
        )[:8000]

    def build_snapshot(self, *, fmt: str, data: str) -> str:
        """
        Public helper to build a structured snapshot from raw merchant data.
        """
        if fmt == "json":
            return self._snapshot_from_json(data)
        if fmt == "csv":
            return self._snapshot_from_csv(data)
        # Fallback to raw text for unknown formats.
        return f"Unrecognized format '{fmt}'. Raw body:\n{data[:4000]}"

    def run_reasoning(
        self,
        *,
        fmt: str,
        data: str,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute the 3-step reasoning chain on the given merchant data.

        The session_id is included in the response for clients to track separate
        analysis sessions if needed. Conversation memory is currently global to
        the engine instance.
        """
        snapshot = self.build_snapshot(fmt=fmt, data=data)

        # Let ConversationBufferMemory handle conversation_history automatically.
        outputs = self.pipeline(
            {
                "structured_merchant_snapshot": snapshot,
            }
        )

        return {
            "analysis": outputs["analysis"],
            "insight": outputs["insight"],
            "recommendation": outputs["recommendation"],
            "session_id": session_id,
        }

