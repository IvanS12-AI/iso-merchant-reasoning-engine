## ISO Merchant Reasoning Engine

AI-powered 3-step reasoning engine for Independent Sales Organizations (ISOs). It analyzes merchant datasets and produces:

1. **Data Analysis**
2. **Insight Generation**
3. **Strategic Recommendation**

The project is split into a FastAPI backend and a Next.js AI SaaS-style dashboard frontend.

---

## Project Structure

- **backend**: FastAPI + LangChain reasoning engine
  - `main.py`: FastAPI app and `/analyze` endpoint
  - `chains/analysis_chain.py`: Step 1 – data analysis chain
  - `chains/insight_chain.py`: Step 2 – insight generation chain
  - `chains/recommendation_chain.py`: Step 3 – recommendation chain
  - `services/reasoning_engine.py`: Orchestration of the 3-step SequentialChain with memory
  - `models/schemas.py`: Pydantic request/response models
- **frontend**: Next.js (App Router) dashboard
  - `app/page.tsx`: Main dashboard with merchant form, CSV upload, reasoning timeline, and history
  - `app/layout.tsx`, `app/globals.css`: Layout and Tailwind setup
  - `components/MerchantForm.tsx`: Structured merchant KPI input form
  - `components/CSVUploader.tsx`: CSV upload and parsing to merchant KPIs
  - `components/ReasoningTimeline.tsx`: 3-step AI reasoning timeline
  - `components/AnalysisHistory.tsx`: Local analysis history backed by `localStorage`
  - `components/ReasoningResult.tsx`: Three-card view of the latest reasoning output
  - `lib/api.ts`: Typed client for the `/analyze` API
- `requirements.txt`: Python dependencies for the backend
- `.env.example`: Example environment configuration

---

## Backend – FastAPI + LangChain

### 1. Install dependencies

From the project root:

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows PowerShell
pip install -r requirements.txt
```

### 2. Configure environment

Copy `.env.example` to `.env` and set your OpenAI API key:

```bash
copy .env.example .env
```

Edit `.env`:

```text
OPENAI_API_KEY=your-openai-api-key-here
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

### 3. Run the backend

From the project root:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

- Health check: `GET /health`
- Reasoning endpoint: `POST /analyze`

#### `/analyze` request shape

The backend expects structured merchant KPIs as JSON:

```json
{
  "merchant_data": {
    "monthly_revenue": 120000,
    "transactions": 850,
    "chargebacks": 5,
    "avg_ticket": 140
  },
  "session_id": null
}
```

- **merchant_data**: structured KPIs used to build the internal snapshot.
- **session_id**: optional identifier to keep conversational context across calls.

#### `/analyze` response shape

```json
{
  "result": {
    "analysis": "...",
    "insight": "...",
    "recommendation": "..."
  },
  "session_id": "optional-session-id"
}
```

Internally, the backend uses:

- A **SequentialChain** of three LangChain `LLMChain`s:
  - Analysis → Insight → Recommendation
- **ConversationBufferMemory** to preserve context across calls.

---

## Frontend – Next.js Dashboard

### 1. Install Node dependencies

From the `frontend` folder:

```bash
cd frontend
npm install
```

### 2. Configure backend URL (optional)

By default, the dashboard calls `http://localhost:8000/analyze`.

To override this, create `frontend/.env.local`:

```text
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 3. Run the frontend

From the `frontend` folder:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

---

## Using the Dashboard

1. Open `http://localhost:3000`.
2. Choose how to provide merchant data:
   - **Merchant form**: manually enter `monthly_revenue`, `transactions`, `chargebacks`, `avg_ticket`.
   - **CSV upload**: upload a CSV with header:
     `monthly_revenue,transactions,chargebacks,avg_ticket`. The first data row is parsed in the browser and sent as structured JSON.
3. Click **“Run Analysis”** (form) or **“Upload & Analyze”** (CSV).
4. The UI shows the reasoning in multiple views:
   - **AI Reasoning Timeline**: vertical 3-step timeline:
     - Step 1 — Data Analysis
     - Step 2 — Business Insight
     - Step 3 — Strategic Recommendation
   - **Reasoning cards**: analysis, insight, and recommendation text rendered in glassy cards.
   - **Analysis history**: prior runs stored in `localStorage`, showing timestamp, revenue, and transactions. Clicking a history entry reloads its full reasoning into the timeline.

Buttons show loading states such as “AI analyzing merchant performance...” while waiting for the backend.

---

## Notes

- The backend expects a valid `OPENAI_API_KEY` in your environment.
- Conversation context is preserved on the server via `ConversationBufferMemory`. You can extend this to use distinct sessions by propagating `session_id` from the response back into subsequent requests.

