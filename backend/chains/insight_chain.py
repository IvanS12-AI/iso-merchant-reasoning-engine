from langchain.chains import LLMChain
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate


def build_insight_chain(llm: BaseLanguageModel) -> LLMChain:
    """
    Build the second step of the reasoning pipeline: insight generation.

    The chain expects one input variable:
    - `analysis`: narrative analysis text produced by the analysis chain.
    """

    prompt = PromptTemplate(
        input_variables=["analysis"],
        template=(
            "You are advising a portfolio manager at an Independent Sales Organization (ISO).\n\n"
            "You are given this prior DATA ANALYSIS of a merchant's performance:\n"
            "{analysis}\n\n"
            "Step 2 – INSIGHT GENERATION\n"
            "Transform the analysis into higher-level business insights. Explain:\n"
            "- What is going well for this merchant and why\n"
            "- What is not going well and the likely root causes\n"
            "- How the merchant's profile compares to typical peers in the ISO's portfolio\n\n"
            "Write 3–6 bullet points that clearly explain what the numbers and patterns REALLY mean.\n"
            "Do not repeat the raw metrics; focus on interpretation and implications."
        ),
    )

    return LLMChain(llm=llm, prompt=prompt, output_key="insight")

