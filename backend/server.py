from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class EquityQuestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    category: str
    order: int

class AssessmentResponse(BaseModel):
    question_id: str
    question_text: str
    response: str
    score: Optional[int] = None

class ResearchRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    email_content: str
    researcher_name: Optional[str] = None
    institution: Optional[str] = None
    assessment_responses: List[AssessmentResponse] = []
    ai_feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "draft"  # draft, assessed, completed

class ResearchRequestCreate(BaseModel):
    title: str
    email_content: str
    researcher_name: Optional[str] = None
    institution: Optional[str] = None

class AssessmentSubmission(BaseModel):
    request_id: str
    responses: List[AssessmentResponse]

class FeedbackGeneration(BaseModel):
    request_id: str

# Default Equity Questions
DEFAULT_EQUITY_QUESTIONS = [
    {
        "question": "Who specifically benefits from this research? Are Black communities centered in the research outcomes?",
        "category": "Impact & Benefit",
        "order": 1
    },
    {
        "question": "How are Black communities involved in the research design, methodology, and decision-making processes?",
        "category": "Participation & Co-Creation",
        "order": 2
    },
    {
        "question": "What resources, compensation, or support are being offered to community members and organizations participating in this research?",
        "category": "Resource Equity",
        "order": 3
    },
    {
        "question": "How will the research findings be shared with and made accessible to Black communities?",
        "category": "Knowledge Sharing",
        "order": 4
    },
    {
        "question": "What mechanisms are in place to ensure accountability and ongoing engagement with the community beyond data collection?",
        "category": "Accountability",
        "order": 5
    },
    {
        "question": "How does this research address historical power imbalances and avoid extractive practices?",
        "category": "Power Dynamics",
        "order": 6
    },
    {
        "question": "What safeguards exist to ensure that the research does not perpetuate harm or stereotypes about Black communities?",
        "category": "Safety & Ethics",
        "order": 7
    }
]

# Routes
@api_router.get("/")
async def root():
    return {"message": "Assess & Align API"}

@api_router.get("/equity-questions", response_model=List[EquityQuestion])
async def get_equity_questions():
    """Get all equity assessment questions"""
    questions = await db.equity_questions.find({}, {"_id": 0}).to_list(100)
    
    if not questions:
        # Initialize with default questions
        for q_data in DEFAULT_EQUITY_QUESTIONS:
            q_obj = EquityQuestion(**q_data)
            doc = q_obj.model_dump()
            await db.equity_questions.insert_one(doc)
        questions = await db.equity_questions.find({}, {"_id": 0}).to_list(100)
    
    return questions

@api_router.post("/research-requests", response_model=ResearchRequest)
async def create_research_request(input: ResearchRequestCreate):
    """Create a new research request for assessment"""
    request_dict = input.model_dump()
    request_obj = ResearchRequest(**request_dict)
    
    doc = request_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    _ = await db.research_requests.insert_one(doc)
    return request_obj

@api_router.get("/research-requests", response_model=List[ResearchRequest])
async def get_research_requests():
    """Get all research requests"""
    requests = await db.research_requests.find({}, {"_id": 0}).to_list(1000)
    
    for req in requests:
        if isinstance(req['created_at'], str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
    
    return requests

@api_router.get("/research-requests/{request_id}", response_model=ResearchRequest)
async def get_research_request(request_id: str):
    """Get a specific research request"""
    request = await db.research_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Research request not found")
    
    if isinstance(request['created_at'], str):
        request['created_at'] = datetime.fromisoformat(request['created_at'])
    
    return request

@api_router.post("/assessments/submit")
async def submit_assessment(submission: AssessmentSubmission):
    """Submit assessment responses for a research request"""
    request = await db.research_requests.find_one({"id": submission.request_id})
    
    if not request:
        raise HTTPException(status_code=404, detail="Research request not found")
    
    # Update the request with assessment responses
    responses_dict = [r.model_dump() for r in submission.responses]
    
    await db.research_requests.update_one(
        {"id": submission.request_id},
        {"$set": {
            "assessment_responses": responses_dict,
            "status": "assessed"
        }}
    )
    
    return {"message": "Assessment submitted successfully", "request_id": submission.request_id}

@api_router.post("/feedback/generate")
async def generate_feedback(input: FeedbackGeneration):
    """Generate AI feedback based on the assessment"""
    request = await db.research_requests.find_one({"id": input.request_id})
    
    if not request:
        raise HTTPException(status_code=404, detail="Research request not found")
    
    if not request.get('assessment_responses'):
        raise HTTPException(status_code=400, detail="No assessment responses found. Please complete the assessment first.")
    
    # Prepare context for AI
    context = f"""Research Request Title: {request['title']}

Research Request Content:
{request['email_content']}

Equity Assessment Responses:
"""
    
    for response in request['assessment_responses']:
        context += f"\nQuestion: {response['question_text']}\nResponse: {response['response']}\n"
    
    # Generate feedback using Claude Sonnet 4
    try:
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"feedback-{input.request_id}",
            system_message="""You are an expert advisor on equitable research practices with Black communities. 
            Your role is to provide constructive, specific feedback to researchers based on equity assessment responses.
            
            Guidelines:
            - Be constructive and supportive while being honest about concerns
            - Highlight strengths in their approach
            - Identify specific areas for improvement
            - Suggest concrete actions they can take
            - Focus on maximizing value sharing and minimizing extractive practices
            - Emphasize community empowerment and genuine partnership
            - Be culturally sensitive and aware of historical context"""
        ).with_model("anthropic", "claude-3-7-sonnet-20250219")
        
        user_message = UserMessage(
            text=f"""Based on the research request and equity assessment responses below, provide detailed, constructive feedback for the researcher.
            
            {context}
            
            Please structure your feedback with:
            1. Strengths: What they're doing well
            2. Areas for Improvement: Specific concerns
            3. Recommendations: Concrete actions to enhance equity
            4. Overall Assessment: Summary guidance
            
            Keep the tone professional, supportive, and focused on helping them create truly equitable research partnerships."""
        )
        
        feedback = await chat.send_message(user_message)
        
        # Update the request with AI feedback
        await db.research_requests.update_one(
            {"id": input.request_id},
            {"$set": {
                "ai_feedback": feedback,
                "status": "completed"
            }}
        )
        
        return {"feedback": feedback, "request_id": input.request_id}
    
    except Exception as e:
        logger.error(f"Error generating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate feedback: {str(e)}")

@api_router.get("/analytics/summary")
async def get_analytics_summary():
    """Get anonymized analytics summary"""
    total_requests = await db.research_requests.count_documents({})
    completed_assessments = await db.research_requests.count_documents({"status": "completed"})
    
    # Get category scores aggregation
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$unwind": "$assessment_responses"},
        {"$group": {
            "_id": None,
            "avg_responses": {"$avg": {"$strLenCP": "$assessment_responses.response"}}
        }}
    ]
    
    avg_data = await db.research_requests.aggregate(pipeline).to_list(1)
    
    # Get requests over time
    recent_requests = await db.research_requests.count_documents({
        "created_at": {"$gte": datetime.now(timezone.utc).replace(day=1).isoformat()}
    })
    
    return {
        "total_requests": total_requests,
        "completed_assessments": completed_assessments,
        "recent_requests_this_month": recent_requests,
        "avg_response_length": avg_data[0]['avg_responses'] if avg_data else 0
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()