import os
import json
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from models.schemas import (
MerchantAnalysisRequest,
MerchantAnalysisResponse,
ReasoningResult,
)
from services.reasoning_engine import ReasoningEngine, ReasoningEngineConfig


def create_app() -> FastAPI:
"""
Application factory for the FastAPI backend.
"""
# Load environment variables from a .env file in the project root, if present.
# This lets you configure OPENAI_API_KEY, BACKEND_HOST, etc. without exporting
# them manually each time.
load_dotenv()

app = FastAPI(
    title="ISO Merchant Reasoning Engine",
    description=(
        "Analyzes merchant datasets and produces a 3-step reasoning chain:\n"
        "1) Data Analysis\n2) Insight Generation\n3) Strategic Recommendation"
    ),
    version="1.0.0",
)

# Basic CORS configuration so the Next.js frontend can call this API from localhost.
frontend_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://iso-merchant-reasoning-engine.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the shared reasoning engine instance.
engine = ReasoningEngine(config=ReasoningEngineConfig())

@app.post("/analyze", response_model=MerchantAnalysisResponse)
async def analyze_merchant_data(
    request: MerchantAnalysisRequest,
) -> MerchantAnalysisResponse:
    """
    Run the 3-step reasoning engine on the incoming merchant dataset.

    The endpoint accepts structured merchant JSON data and returns a structured
    response with:
    - analysis
    - insight
    - recommendation
    """
    merchant_dict = request.merchant_data.model_dump()

    snapshot = json.dumps(merchant_dict, indent=2)

    try:
        result = engine.run_reasoning(
            fmt="json",
            data=snapshot,
            session_id=request.session_id,
        )
    except ValidationError as e:
        # Surface Pydantic validation issues in a readable way.
        raise e

    reasoning = ReasoningResult(
        analysis=result["analysis"],
        insight=result["insight"],
        recommendation=result["recommendation"],
    )
    return MerchantAnalysisResponse(result=reasoning, session_id=result.get("session_id"))

@app.get("/health")
async def health_check() -> dict:
    """
    Simple health endpoint for monitoring and local debugging.
    """
    return {"status": "ok"}

return app


app = create_app()


if __name__ == "__main__":
import uvicorn

uvicorn.run(
    "backend.main:app",
    host=os.getenv("BACKEND_HOST", "0.0.0.0"),
    port=int(os.getenv("BACKEND_PORT", "8000")),
    reload=True,
)

