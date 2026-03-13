from typing import Optional

from pydantic import BaseModel, Field


class MerchantData(BaseModel):
    """
    Structured merchant data payload.
    """

    monthly_revenue: float
    transactions: int
    chargebacks: int
    avg_ticket: float


class MerchantAnalysisRequest(BaseModel):
    """
    Request body for the /analyze endpoint.
    """

    merchant_data: MerchantData = Field(
        description="Structured merchant metrics used for analysis."
    )
    session_id: Optional[str] = Field(
        default=None,
        description=(
            "Identifier for the conversational session. "
            "Clients may reuse this to continue context across multiple calls."
        ),
    )


class ReasoningResult(BaseModel):
    """
    Structured reasoning output for a single analysis run.
    """

    analysis: str = Field(description="Step 1 – Data analysis narrative and KPIs.")
    insight: str = Field(description="Step 2 – Interpretation of what the analysis means.")
    recommendation: str = Field(
        description="Step 3 – Strategic recommendations for the ISO."
    )


class MerchantAnalysisResponse(BaseModel):
    """
    Response envelope for /analyze.
    """

    result: ReasoningResult
    session_id: Optional[str] = Field(
        default=None,
        description=(
            "Identifier for the conversational session. "
            "Clients may reuse this to continue context across multiple calls."
        ),
    )

