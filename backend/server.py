from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import re
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="BranchIQ API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("branchiq")


# ---------------------------- Models ----------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ConsultantRequest(BaseModel):
    question: str
    selectedBank: Optional[str] = None
    context: Dict[str, Any] = Field(default_factory=dict)


class ConsultantResponse(BaseModel):
    intent: str
    banks: List[str] = Field(default_factory=list)
    executiveAnswer: str
    keyEvidence: List[str] = Field(default_factory=list)
    opportunityScore: Optional[int] = None
    businessReasoning: str
    recommendedAction: str
    dataConfidence: str = "MEDIUM"
    supportingData: List[Dict[str, Any]] = Field(default_factory=list)


SYSTEM_PROMPT = """You are BranchIQ, an AI Banking Network Strategy Consultant for the Indian banking sector.
You operate like a McKinsey/BCG strategy engagement — precise, evidence-led, executive tone. You are NOT a chatbot.

STRICT RULES:
- Use ONLY the DATA CONTEXT provided by the caller (public, curated banking/market indicators + BranchIQ analytical scores). Never invent official bank statistics.
- Opportunity scores are BranchIQ model-generated estimates, not official bank forecasts. Never present them as official figures.
- Never say a branch "should be closed". Use phrasing like "candidate for network review", "potential optimization opportunity", "potential digital-first opportunity", "further management validation required".
- BranchIQ never uses confidential customer or internal bank data.
- Every answer MUST follow the BranchIQ analytical framework.

You MUST respond with a SINGLE valid JSON object (no markdown, no prose outside JSON) with exactly these keys:
{
  "intent": one of ["BANK COMPARISON","MARKET EXPANSION","NETWORK OPTIMIZATION","DIGITAL-FIRST","COMPETITIVE POSITIONING","REGIONAL STRATEGY","GENERAL"],
  "banks": [bank names detected in the question, else []],
  "executiveAnswer": "1-2 crisp executive sentences answering directly",
  "keyEvidence": ["4-6 short quantitative evidence bullets drawn from the DATA CONTEXT"],
  "opportunityScore": integer 0-100 or null (use scores from context when relevant),
  "businessReasoning": "2-3 sentences of strategic reasoning grounded in the data",
  "recommendedAction": "1-2 sentences, concrete and compliant with the phrasing rules",
  "dataConfidence": "HIGH" | "MEDIUM" | "LIMITED",
  "supportingData": [{"label":"...","value":"...","source":"..."}]  (2-5 items pulled from context)
}
Keep it factual, specific, and tied to the numbers in the DATA CONTEXT."""


def _extract_json(text: str) -> Optional[dict]:
    if not text:
        return None
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                return None
    return None


def _fallback_response(req: ConsultantRequest) -> ConsultantResponse:
    ctx = req.context or {}
    top = ctx.get("topOpportunities") or []
    bank = req.selectedBank or (ctx.get("bank", {}) or {}).get("name") or "the selected bank"
    if top:
        best = top[0]
        state = best.get("state", "priority markets")
        score = best.get("score")
        drivers = best.get("drivers", []) or []
        evidence = [f"{state}: BranchIQ Opportunity Score {score}/100"]
        for d in drivers[:3]:
            evidence.append(d)
        for t in top[1:4]:
            evidence.append(f"{t.get('state')}: Opportunity Score {t.get('score')}/100")
        return ConsultantResponse(
            intent="MARKET EXPANSION",
            banks=[bank] if req.selectedBank else [],
            executiveAnswer=f"{state} presents the strongest network opportunity for {bank} among the assessed markets.",
            keyEvidence=evidence[:6],
            opportunityScore=score,
            businessReasoning="Market fundamentals in the leading state are attractive while the bank's relative network intensity leaves headroom versus the strongest competitors.",
            recommendedAction=f"Evaluate selective physical and digital distribution expansion across high-growth micro-markets in {state}; further management validation required.",
            dataConfidence="MEDIUM",
            supportingData=[{"label": t.get("state"), "value": f"{t.get('score')}/100", "source": "BranchIQ Analytical Score"} for t in top[:4]],
        )
    return ConsultantResponse(
        intent="GENERAL",
        banks=[bank] if req.selectedBank else [],
        executiveAnswer="BranchIQ combines public banking and market indicators with an analytical scoring framework to guide network strategy.",
        keyEvidence=["Select a bank and market to generate a data-backed strategic assessment."],
        opportunityScore=None,
        businessReasoning="Strategic recommendations are derived from public market indicators and BranchIQ analytical scores, not confidential bank data.",
        recommendedAction="Choose a bank and state to receive a structured opportunity assessment; further management validation required.",
        dataConfidence="LIMITED",
        supportingData=[],
    )


# ---------------------------- Routes ----------------------------
@api_router.get("/")
async def root():
    return {"message": "BranchIQ API online", "status": "Public Data Connected"}


@api_router.post("/consultant/ask", response_model=ConsultantResponse)
async def consultant_ask(req: ConsultantRequest):
    result: ConsultantResponse
    used_llm = False
    if EMERGENT_LLM_KEY:
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"branchiq-{uuid.uuid4()}",
                system_message=SYSTEM_PROMPT,
            ).with_model("anthropic", "claude-sonnet-4-6")

            payload = (
                f"QUESTION: {req.question}\n\n"
                f"SELECTED BANK: {req.selectedBank or 'None'}\n\n"
                f"DATA CONTEXT (JSON):\n{json.dumps(req.context, ensure_ascii=False)}\n\n"
                "Respond with the single JSON object as instructed."
            )
            raw = await chat.send_message(UserMessage(text=payload))
            data = _extract_json(raw if isinstance(raw, str) else str(raw))
            if data and data.get("executiveAnswer"):
                result = ConsultantResponse(
                    intent=data.get("intent", "GENERAL"),
                    banks=data.get("banks", []) or [],
                    executiveAnswer=data.get("executiveAnswer", ""),
                    keyEvidence=data.get("keyEvidence", []) or [],
                    opportunityScore=data.get("opportunityScore"),
                    businessReasoning=data.get("businessReasoning", ""),
                    recommendedAction=data.get("recommendedAction", ""),
                    dataConfidence=data.get("dataConfidence", "MEDIUM"),
                    supportingData=data.get("supportingData", []) or [],
                )
                used_llm = True
            else:
                result = _fallback_response(req)
        except Exception as e:
            logger.error(f"LLM consultant error: {e}")
            result = _fallback_response(req)
    else:
        result = _fallback_response(req)

    try:
        await db.consultant_queries.insert_one({
            "id": str(uuid.uuid4()),
            "question": req.question,
            "selectedBank": req.selectedBank,
            "usedLLM": used_llm,
            "response": result.model_dump(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.error(f"Mongo insert error: {e}")

    return result


@api_router.get("/consultant/history")
async def consultant_history(limit: int = 20):
    docs = await db.consultant_queries.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return docs


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
