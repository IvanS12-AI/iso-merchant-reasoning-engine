from langchain.chains import LLMChain
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate


def build_analysis_chain(llm: BaseLanguageModel) -> LLMChain:
    """
    Build the first step of the reasoning pipeline: data analysis.

    The chain expects a single input variable:
    - `structured_merchant_snapshot`: a concise textual description of the parsed merchant dataset.
    """

    prompt = PromptTemplate(
        input_variables=["structured_merchant_snapshot"],
        template=(
            "You are a senior risk and analytics specialist for an Independent "
            "Sales Organization (ISO).\n\n"
            "You receive the following merchant dataset snapshot:\n"
            "{structured_merchant_snapshot}\n\n"
            "Step 1 – DATA ANALYSIS\n"
            "Carefully analyze the merchant's performance and produce a concise but specific analysis. "
            "Focus on:\n"
            "- Revenue trends (growth/decline, seasonality)\n"
            "- Transaction volume and ticket sizes\n"
            "- Chargeback or dispute patterns (if present)\n"
            "- Risk or fraud signals\n"
            "- Notable anomalies or data quality issues\n\n"
            "Respond in 2–4 short paragraphs, using clear language suited for an ISO account manager."
        ),
    )

    return LLMChain(llm=llm, prompt=prompt, output_key="analysis")

