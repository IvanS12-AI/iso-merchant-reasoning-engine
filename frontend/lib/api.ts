export type MerchantData = {
  monthly_revenue: number;
  transactions: number;
  chargebacks: number;
  avg_ticket: number;
};

export type ReasoningResult = {
  analysis: string;
  insight: string;
  recommendation: string;
};

type ApiResponse = {
  result: ReasoningResult;
  session_id?: string | null;
};

export async function analyzeMerchant(
  data: MerchantData
): Promise<ReasoningResult> {
  const res = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      merchant_data: data
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Backend returned ${res.status}. Details: ${text || "No body"}`
    );
  }

  const json = (await res.json()) as ApiResponse;
  return json.result;
}

