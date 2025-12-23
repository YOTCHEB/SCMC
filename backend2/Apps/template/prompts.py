from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any
import json
import sqlite3
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import Tool
from Apps.Model.nlp import MCMC
from Apps.Model.cofing import Link_URL_EMBEDDING, Secret, Link_URL

router = APIRouter()


# Memory Setup (per user) - Persistent Database Storage
def get_db_connection():
    """Get a connection to the user progress database"""
    db_path = "user_progress.db"
    return sqlite3.connect(db_path)

def init_memory_tables():
    """Initialize database tables for conversation memory and user data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create conversation_memory table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            category TEXT,
            user_input TEXT,
            ai_response TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    # Create users table with extended schema
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            phone TEXT,
            birthday TEXT,
            sex TEXT,
            template TEXT,
            profile_picture TEXT,
            cv_file_path TEXT,
            cv_content TEXT,
            confirmation_code TEXT,
            is_confirmed BOOLEAN DEFAULT FALSE,
            card_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create email_confirmations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS email_confirmations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            confirmation_code TEXT,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            is_used BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    # Create education_programs table for education template users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS education_programs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            program_name TEXT,
            program_start_date TEXT,
            program_end_date TEXT,
            daily_schedule TEXT,
            program_duration_unit TEXT,
            program_duration_length INTEGER,
            expected_completion_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    # Create attendance_tracking table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            session_date TEXT,
            session_time TEXT,
            status TEXT, -- present, late, absent
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    ''')
    
    conn.commit()
    conn.close()


def update_memory(user_id: str, category: str, user_input: str, ai_response: str):
    """Store conversation in persistent database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ensure user exists
    cursor.execute(
        "INSERT OR IGNORE INTO users (user_id) VALUES (?)",
        (user_id,)
    )
    
    # Store conversation
    cursor.execute(
        "INSERT INTO conversation_memory (user_id, category, user_input, ai_response) VALUES (?, ?, ?, ?)",
        (user_id, category, user_input, ai_response)
    )
    
    conn.commit()
    conn.close()

def retrieve_memory(user_id: str, category: str) -> str:
    """Retrieve conversation history from database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT user_input, ai_response FROM conversation_memory WHERE user_id = ? AND category = ? ORDER BY timestamp DESC LIMIT 10",
        (user_id, category)
    )
    
    conversations = []
    for user_input, ai_response in cursor.fetchall():
        conversations.append(f"User: {user_input}\nAI: {ai_response}")
    
    conn.close()
    
    if not conversations:
        return "No previous conversation."
    
    return "\n\n".join(reversed(conversations[-5:]))


# LLM & Prompt Chains

llm = MCMC

Career_task = """
You are a professional career advisor. Teach, explain, and interact naturally with the user.
Rules:
0. The user's name is {user_name}. Always remember and use the user's name in your responses when appropriate.
1. Only answer career-related questions.
2. You can ask questions to the user, wait for their answer, and then check if it is correct.
3. Provide feedback after each answer: explain, correct, or confirm.
4. Continue the interaction as a tutor, step by step.
5. If the user seems unsure about what to ask, suggest relevant topics from the list below.



Previous Conversation: {history}
User Topic: {topic}
User Input: {user_input}
"""

Business_task = """
You are a business consultant. Teach, explain, and interact naturally with the user.
Rules:
0. The user's name is {user_name}. Always remember and use the user's name in your responses when appropriate.
1. Only answer business-related questions.
2. You can ask questions to the user, wait for their answer, and then check if it is correct.
3. Provide feedback after each answer: explain, correct, or confirm.
4. Continue the interaction as a tutor, step by step.
5. If the user seems unsure about what to ask, suggest relevant topics from the list below.



Previous Conversation: {history}
User Topic: {topic}
User Input: {user_input}
"""

Education_task = """
You are an education assistant. Teach, explain, and interact naturally with the user.
Rules:
0. The user's name is {user_name}. Always remember and use the user's name in your responses when appropriate.
1. Only answer education-related questions.
2. You can ask questions to the user, wait for their answer, and then check if it is correct.
3. Provide feedback after each answer: explain, correct, or confirm.
4. Continue the interaction as a tutor, step by step.
5. If the user seems unsure about what to ask, suggest relevant topics from the list below.


Previous Conversation: {history}
User Topic: {topic}
User Input: {user_input}
"""

Financing_task = """
You are a finance advisor. Teach, explain, and interact naturally with the user.
Rules:
0. The user's name is {user_name}. Always remember and use the user's name in your responses when appropriate.
1. Only answer finance-related questions.
2. You can ask questions to the user, wait for their answer, and then check if it is correct.
3. Provide feedback after each answer: explain, correct, or confirm.
4. Continue the interaction as a tutor, step by step.
5. If the user seems unsure about what to ask, suggest relevant topics from the list below.



Previous Conversation: {history}
User Topic: {topic}
User Input: {user_input}
"""


def create_chain(template: str):
    return PromptTemplate(
        input_variables=["topic", "user_input", "history", "user_name"],
        template=template
    ) | llm | StrOutputParser()

career_chain = create_chain(Career_task)
business_chain = create_chain(Business_task)
education_chain = create_chain(Education_task)
financing_chain = create_chain(Financing_task)


# Quiz & Interview

Quiz_task = """
Generate {num_questions} quiz questions about "{topic}".
Output as a JSON list of objects with fields: id, question, options (list), type ("text" or "multiple").
Do NOT provide answers.
"""

Interview_task = """
Generate {num_questions} interview questions about "{topic}".
Output as a JSON list of objects with fields: id, question, options (optional), type ("text" or "multiple").
"""

Correction_task = """
Correct the user's answers: {answers} for category "{category}".
Return JSON: list of objects with id, user_answer, correct_answer, correct (bool), feedback.
"""

def generate_quiz(user_id: str, topic: str, num_questions: int = 5):
    prompt = Quiz_task.format(topic=topic, num_questions=num_questions)
    raw_output = llm(prompt)
    try:
        questions = json.loads(raw_output)
    except:
        questions = [{"id": f"q{i+1}", "question": q} for i, q in enumerate(raw_output.splitlines())]
    return {"user_id": user_id, "questions": questions, "timestamp": datetime.utcnow().isoformat()}

def generate_interview(user_id: str, topic: str, num_questions: int = 5):
    prompt = Interview_task.format(topic=topic, num_questions=num_questions)
    raw_output = llm(prompt)
    try:
        questions = json.loads(raw_output)
    except:
        questions = [{"id": f"q{i+1}", "question": q} for i, q in enumerate(raw_output.splitlines())]
    return {"user_id": user_id, "questions": questions, "timestamp": datetime.utcnow().isoformat()}

def submit_answers(user_id: str, category: str, answers: Dict[str, Any]):
    prompt = Correction_task.format(answers=json.dumps(answers), category=category)
    raw_output = llm(prompt)
    try:
        results = json.loads(raw_output)
    except:
        results = []
    score = sum(1 for r in results if r.get("correct"))
    return {
        "user_id": user_id,
        "results": {r.get("id"): r for r in results},
        "score": int((score / len(results)) * 100) if results else 0,
        "feedback": "Correction complete.",
        "timestamp": datetime.utcnow().isoformat()
    }


# First, we need to get the user's name from the database
def get_user_name(user_id: str) -> str:
    """Get user name from database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT name FROM users WHERE user_id = ?",
            (user_id,)
        )
        
        result = cursor.fetchone()
        conn.close()
        
        
        if result and result[0]:
            return result[0]
        else:
            return "User"
    except:
       
        conn.close()
        return "User"

career_tool = Tool(
    name="Career Advisor",
    func=lambda user_id, topic, user_input: career_chain(
        topic=topic,
        user_input=user_input,
        history=retrieve_memory(user_id, "career"),
        user_name=get_user_name(user_id)
    ),
    description="Answer career-related questions."
)

business_tool = Tool(
    name="Business Consultant",
    func=lambda user_id, topic, user_input: business_chain(
        topic=topic,
        user_input=user_input,
        history=retrieve_memory(user_id, "business"),
        user_name=get_user_name(user_id)
    ),
    description="Answer business-related questions."
)

education_tool = Tool(
    name="Education Assistant",
    func=lambda user_id, topic, user_input: education_chain(
        topic=topic,
        user_input=user_input,
        history=retrieve_memory(user_id, "education"),
        user_name=get_user_name(user_id)
    ),
    description="Answer education-related questions."
)

financing_tool = Tool(
    name="Finance Advisor",
    func=lambda user_id, topic, user_input: financing_chain(
        topic=topic,
        user_input=user_input,
        history=retrieve_memory(user_id, "finance"),
        user_name=get_user_name(user_id)
    ),
    description="Answer finance-related questions."
)


# FastAPI Schemas

class ToolRequest(BaseModel):
    user_id: str
    topic: str
    category: str
    user_input: str = ""
    num_questions: int = 5
    answers: Dict[str, Any] = {}

class ToolResponse(BaseModel):
    user_id: str
    category: str
    response: Any
    timestamp: datetime


# FastAPI Endpoint

@router.post("/tools/use", response_model=ToolResponse)
async def use_tool(req: ToolRequest):
    category_map = {
        "career": career_tool,
        "business": business_tool,
        "education": education_tool,
        "finance": financing_tool,
        "quiz": Tool(name="Quiz Generator", func=generate_quiz, description="Generate quiz questions."),
        "interview": Tool(name="Interview Generator", func=generate_interview, description="Generate interview questions."),
        "correction": Tool(name="Answer Correction", func=submit_answers, description="Correct and score answers.")
    }
    tool = category_map.get(req.category.lower())
    if not tool:
        return ToolResponse(
            user_id=req.user_id,
            category=req.category,
            response=f"Invalid category: {req.category}",
            timestamp=datetime.utcnow()
        )
    try:
        if req.category.lower() in ["quiz", "interview"]:
            answer = tool.func(req.user_id, req.topic, req.num_questions)
        elif req.category.lower() == "correction":
            answer = tool.func(req.user_id, req.category, req.answers)
        else:
            answer = tool.func(req.user_id, req.topic, req.user_input)
        
        update_memory(req.user_id, req.category, req.user_input or str(req.answers), str(answer))
        return ToolResponse(
            user_id=req.user_id,
            category=req.category,
            response=answer,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        return ToolResponse(
            user_id=req.user_id,
            category=req.category,
            response=f"Error: {str(e)}",
            timestamp=datetime.utcnow()
        )
