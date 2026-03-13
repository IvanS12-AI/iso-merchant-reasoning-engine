from langchain.chains import LLMChain
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate


def build_recommendation_chain(llm: BaseLanguageModel) -> LLMChain:
    """
    Build the third step of the reasoning pipeline: strategic recommendations.

    The chain expects one input variable:
    - `insight`: insight text produced by the insight chain.
    """

    prompt = PromptTemplate(
        input_variables=["insight"],
        template=(
            "You are a strategic consultant for an Independent Sales Organization (ISO).\n\n"
            "You are given the following INSIGHTS about a merchant's performance:\n"
            "{insight}\n\n"
            "Step 3 – STRATEGIC RECOMMENDATIONS\n"
            "Based on these insights, provide 4–7 specific, actionable recommendations for the ISO. "
            "Cover:\n"
            "- Portfolio and risk management actions\n"
            "- Pricing or fee structure adjustments\n"
            "- Risk controls (e.g., velocity checks, chargeback management)\n"
            "- Merchant enablement (e.g., education, tools, product changes)\n\n"
            "Write your answer as numbered recommendations. Each recommendation should be 1–2 sentences and "
            "explicitly tie back to the insights above."
        ),
    )

    return LLMChain(llm=llm, prompt=prompt, output_key="recommendation")

