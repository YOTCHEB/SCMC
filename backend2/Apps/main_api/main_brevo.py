from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json
import sqlite3
import uuid
import base64
import random
from Apps.template.prompts import (
    career_chain,
    business_chain,
    education_chain,
    financing_chain,
    update_memory,
    retrieve_memory,
    get_user_name,
    get_db_connection,
    init_memory_tables
)
from Apps.progress_tracker import progress_tracker
from Apps.utils.email_service_brevo import email_service
from Apps.utils.file_upload import file_upload_service
from Apps.main_api.knowledge_test_endpoints_fixed import generate_quiz, submit_quiz_answers, generate_timetable

app = FastAPI(title="Mentor AI API")

origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    category: str
    user_input: str

class QuizTrackRequest(BaseModel):
    user_id: str
    category: str
    score: int
    total_questions: int

class ConversationTrackRequest(BaseModel):
    user_id: str
    category: str
    message_count: int
    avg_response_length: int

class User(BaseModel):
    id: str
    name: str
    birthday: str
    sex: str
    email: str
    phone: str
    profilePicture: str
    template: str
    cardId: str
    createdAt: str

class QuizQuestionRequest(BaseModel):
    user_id: str
    category: str
    question: str
    user_answer: str
    is_correct: bool
    correct_answer: Optional[str] = None

class NotificationReplyRequest(BaseModel):
    user_id: str
    notification_id: int
    reply_message: str
    topic: str

class ExerciseSubmissionRequest(BaseModel):
    user_id: str
    category: str
    exercise_id: str
    answers: Dict[str, Any]
    time_taken: int  # in seconds

class QuizGenerateRequest(BaseModel):
    user_id: str
    category: str
    num_questions: Optional[int] = 5

class QuizSubmitRequest(BaseModel):
    user_id: str
    category: str
    answers: Dict[str, Any]

class TimetableGenerateRequest(BaseModel):
    user_id: str
    category: str
    level: str


class EnhancedUserRegistration(BaseModel):
    name: str
    birthday: str
    sex: str
    email: str
    phone: str
    profilePicture: str
    template: str
    cvFile: Optional[str] = None
    cvFileName: Optional[str] = None
    programName: Optional[str] = None
    programStartDate: Optional[str] = None
    programEndDate: Optional[str] = None
    dailySchedule: Optional[str] = None
    programDurationUnit: Optional[str] = None
    programDurationLength: Optional[str] = None
    expectedCompletionDate: Optional[str] = None

class ConfirmationRequest(BaseModel):
    user_id: str
    confirmation_code: str

def generate_confirmation_code() -> str:
    """Generate a 6-digit confirmation code"""
    return str(uuid.uuid4().int)[:6]

@app.post("/register")
async def register_user(user_data: EnhancedUserRegistration):
    """Register a new user with enhanced features including CV upload and email confirmation"""
    try:
        # Initialize database tables
        init_memory_tables()

        # Generate user ID and card ID
        user_id = str(uuid.uuid4())
        # Generate mixed alphanumeric card ID (12 characters)
        import string
        chars = string.ascii_uppercase + string.digits
        card_id = ''.join(random.choice(chars) for _ in range(12))
        confirmation_code = generate_confirmation_code()

        conn = get_db_connection()
        cursor = conn.cursor()

        # Handle CV file upload if template is career
        cv_file_path = None
        cv_content = None

        if user_data.template == "career" and user_data.cvFile:
            # Decode base64 string to bytes
            try:
                cv_file_bytes = base64.b64decode(user_data.cvFile)
                cv_file_path = file_upload_service.save_cv_file(
                    cv_file_bytes, user_id, user_data.cvFileName or "cv.pdf"
                )
                if cv_file_path:
                    cv_content = file_upload_service.extract_text_from_cv(cv_file_path)
            except Exception as e:
                print(f"Error processing CV file: {e}")
                cv_file_path = None
                cv_content = None

        # Save user to database with all information
        cursor.execute('''
            INSERT INTO users (
                user_id, name, email, phone, birthday, sex, template,
                profile_picture, cv_file_path, cv_content, confirmation_code, card_id, is_confirmed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, user_data.name, user_data.email, user_data.phone, user_data.birthday,
            user_data.sex, user_data.template, user_data.profilePicture, cv_file_path,
            cv_content, confirmation_code, card_id, False
        ))

        # Save education program if template is education
        if user_data.template == "education" and user_data.programName:
            cursor.execute('''
                INSERT INTO education_programs (
                    user_id, program_name, program_start_date, program_end_date,
                    daily_schedule, program_duration_unit, program_duration_length,
                    expected_completion_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                user_data.programName,
                user_data.programStartDate,
                user_data.programEndDate,
                user_data.dailySchedule,
                user_data.programDurationUnit,
                user_data.programDurationLength,
                user_data.expectedCompletionDate
            ))

        # Save confirmation record
        expires_at = datetime.now() + timedelta(hours=24)
        cursor.execute('''
            INSERT INTO email_confirmations (user_id, confirmation_code, email, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (user_id, confirmation_code, user_data.email, expires_at))

        conn.commit()
        conn.close()

        # Send confirmation email
        email_sent = email_service.send_confirmation_email(
            user_data.email, user_data.name, confirmation_code, card_id
        )

        if not email_sent:
            # Log warning but don't fail registration
            print(f"Warning: Failed to send confirmation email to {user_data.email}")

        return {
            "message": "Registration successful. Please check your email for confirmation code.",
            "user_id": user_id,
            "card_id": card_id,
            "email_sent": email_sent,
            "requires_confirmation": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/confirm")
async def confirm_email(confirmation: ConfirmationRequest):
    """Confirm user email with verification code"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if confirmation code is valid and not expired
        cursor.execute('''
            SELECT ec.* FROM email_confirmations ec
            JOIN users u ON ec.user_id = u.user_id
            WHERE ec.user_id = ? AND ec.confirmation_code = ?
            AND ec.expires_at > datetime('now') AND ec.is_used = FALSE
        ''', (confirmation.user_id, confirmation.confirmation_code))

        confirmation_record = cursor.fetchone()

        if not confirmation_record:
            raise HTTPException(status_code=400, detail="Invalid or expired confirmation code")

        # Update user confirmation status
        cursor.execute('''
            UPDATE users SET is_confirmed = TRUE
            WHERE user_id = ?
        ''', (confirmation.user_id,))

        
        cursor.execute('''
            UPDATE email_confirmations SET is_used = TRUE
            WHERE user_id = ? AND confirmation_code = ?
        ''', (confirmation.user_id, confirmation.confirmation_code))

        conn.commit()

        # Get user info for notification
        cursor.execute('''
            SELECT name, card_id, template FROM users WHERE user_id = ?
        ''', (confirmation.user_id,))
        user_info = cursor.fetchone()

        conn.close()

        if user_info:
            name, card_id, template = user_info

            # Create AI notification with ID number
            notification = {
                "title": "Account Confirmed Successfully!",
                "message": f"Hello {name}! Your account has been confirmed. Your Student ID Number is: {card_id}. Save this ID as you will need it to log in. Welcome to your {template} learning journey!",
                "type": "success"
            }

            progress_tracker._store_notifications(confirmation.user_id, [notification])

        return {
            "message": "Email confirmed successfully. You can now log in with your Student ID.",
            "confirmed": True,
            "card_id": card_id if user_info else None
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Confirmation failed: {str(e)}")

@app.post("/resend-confirmation")
async def resend_confirmation(user_id: str):
    """Resend confirmation email"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get user info
        cursor.execute('''
            SELECT name, email, card_id FROM users WHERE user_id = ?
        ''', (user_id,))
        user_info = cursor.fetchone()

        if not user_info:
            raise HTTPException(status_code=404, detail="User not found")

        name, email, card_id = user_info

        # Generate new confirmation code
        new_confirmation_code = generate_confirmation_code()
        expires_at = datetime.now() + timedelta(hours=24)

        # Update confirmation record
        cursor.execute('''
            UPDATE email_confirmations
            SET confirmation_code = ?, expires_at = ?, is_used = FALSE
            WHERE user_id = ?
        ''', (new_confirmation_code, expires_at, user_id))

        conn.commit()
        conn.close()

        # Send new confirmation email
        email_sent = email_service.send_confirmation_email(
            email, name, new_confirmation_code, card_id
        )

        return {
            "message": "Confirmation email resent successfully" if email_sent else "Failed to resend confirmation email",
            "email_sent": email_sent
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resend confirmation: {str(e)}")

@app.get("/user/{user_id}/status")
async def get_user_status(user_id: str):
    """Check if user is confirmed"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT is_confirmed, card_id FROM users WHERE user_id = ?
        ''', (user_id,))

        result = cursor.fetchone()
        conn.close()

        if not result:
            raise HTTPException(status_code=404, detail="User not found")

        is_confirmed, card_id = result
        return {
            "is_confirmed": bool(is_confirmed),
            "card_id": card_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user status: {str(e)}")

@app.post("/tools/generate-quiz")
async def generate_quiz_endpoint(req: QuizGenerateRequest):
    """Generate a quiz for the user"""
    try:
        quiz_data = await generate_quiz(req.user_id, req.category, req.num_questions)
        return quiz_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@app.post("/tools/submit-quiz")
async def submit_quiz_endpoint(req: QuizSubmitRequest):
    """Submit quiz answers"""
    try:
        result = await submit_quiz_answers(req.user_id, req.category, req.answers)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")

@app.post("/tools/generate-timetable")
async def generate_timetable_endpoint(req: TimetableGenerateRequest):
    """Generate a timetable for the user"""
    try:
        timetable_data = await generate_timetable(req.user_id, req.category, req.level)
        return timetable_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate timetable: {str(e)}")

@app.post("/tools/chat")
async def chat_endpoint(req: ChatRequest):
    # Initialize database tables if not exists
    init_memory_tables()
    category = req.category.lower()
    history = retrieve_memory(req.user_id, category)
    user_name = get_user_name(req.user_id)

    if category == "career":
        output = career_chain.invoke({
            "history": history,
            "topic": req.category,
            "user_input": req.user_input,
            "user_name": user_name
        })
    elif category == "business":
        output = business_chain.invoke({
            "history": history,
            "topic": req.category,
            "user_input": req.user_input,
            "user_name": user_name
        })
    elif category == "education":
        output = education_chain.invoke({
            "history": history,
            "topic": req.category,
            "user_input": req.user_input,
            "user_name": user_name
        })
    elif category == "finance":
        output = financing_chain.invoke({
            "history": history,
            "topic": req.category,
            "user_input": req.user_input,
            "user_name": user_name
        })
    else:
        return {"error": f"Invalid category: {req.category}"}

    # Convert to string if needed
    output_text = output.content if hasattr(output, "content") else str(output)

    # Save to memory
    update_memory(req.user_id, category, req.user_input, output_text)

    # Track conversation metrics (message count and average response length)
    message_count = 1  # Current message
    avg_response_length = len(output_text)  # Length of AI response

    # Update progress tracker
    progress_tracker.record_conversation_metrics(
        req.user_id, category, message_count, avg_response_length
    )

    return {"response": output_text}

@app.post("/tools/progress/track")
async def track_progress(req: QuizTrackRequest):
    """Track user quiz scores."""
    try:
        progress_tracker.record_quiz_score(req.user_id, req.category, req.score, req.total_questions)
        return {"message": "Quiz score recorded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/progress/conversation")
async def track_conversation(req: ConversationTrackRequest):
    """Track user conversation metrics."""
    try:
        progress_tracker.record_conversation_metrics(req.user_id, req.category, req.message_count, req.avg_response_length)
        return {"message": "Conversation metrics recorded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/progress/{user_id}")
async def get_progress(user_id: str):
    """Get user progress data."""
    try:
        progress_data = progress_tracker.get_user_progress(user_id)
        return progress_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/progress/question")
async def track_quiz_question(req: QuizQuestionRequest):
    """Track individual quiz question results."""
    try:
        progress_tracker.record_quiz_question(
            req.user_id, req.category, req.question,
            req.user_answer, req.is_correct, req.correct_answer
        )
        return {"message": "Quiz question recorded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/progress/{user_id}/questions")
async def get_quiz_questions(user_id: str, category: str = None):
    """Get quiz questions history for a user."""
    try:
        questions = progress_tracker.get_quiz_questions(user_id, category)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/progress/{user_id}/quiz-stats")
async def get_quiz_stats(user_id: str, category: str = None):
    """Get quiz statistics for a user."""
    try:
        stats = progress_tracker.get_quiz_stats(user_id, category)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/progress/train-model")
async def train_progress_model():
    """Train the progress prediction model."""
    try:
        progress_tracker.train_prediction_model()
        return {"message": "Progress prediction model trained successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/notifications/{user_id}")
async def get_notifications(user_id: str, unread_only: bool = False):
    """Get notifications for a user."""
    try:
        notifications = progress_tracker.get_user_notifications(user_id, unread_only)
        return {"notifications": notifications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int):
    """Mark a notification as read."""
    try:
        progress_tracker.mark_notification_as_read(notification_id)
        return {"message": "Notification marked as read successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/notifications/reply")
async def reply_to_notification(req: NotificationReplyRequest):
    """Reply to a notification with a single message."""
    try:
        # Ensure the notification_replies table exists
        conn = sqlite3.connect('user_progress.db')
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_replies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                notification_id INTEGER NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Check if user has already replied to this notification
        cursor.execute('''
            SELECT id FROM notification_replies
            WHERE user_id = ? AND notification_id = ?
        ''', (req.user_id, req.notification_id))

        existing_reply = cursor.fetchone()
        conn.close()

        if existing_reply:
            raise HTTPException(status_code=400, detail="You have already replied to this notification.")

        # Generate AI response
        history = retrieve_memory(req.user_id, req.topic)
        user_name = get_user_name(req.user_id)

        # Get the appropriate chain based on topic
        if req.topic == "career":
            chain = career_chain
        elif req.topic == "business":
            chain = business_chain
        elif req.topic == "education":
            chain = education_chain
        elif req.topic == "finance":
            chain = financing_chain
        else:
            raise HTTPException(status_code=400, detail="Invalid topic.")

        # Generate AI response
        output = chain.invoke({
            "history": history,
            "topic": req.topic,
            "user_input": req.reply_message,
            "user_name": user_name
        })

        ai_response = output.content if hasattr(output, "content") else str(output)

        # Save reply to database
        conn = sqlite3.connect('user_progress.db')
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_replies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                notification_id INTEGER NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            INSERT INTO notification_replies (user_id, notification_id, user_message, ai_response)
            VALUES (?, ?, ?, ?)
        ''', (req.user_id, req.notification_id, req.reply_message, ai_response))

        conn.commit()
        conn.close()

        # Update memory with this interaction
        update_memory(req.user_id, req.topic, req.reply_message, ai_response)

        # Create a non-replyable notification with AI response
        notification = {
            "title": f"Response to your message",
            "message": ai_response,
            "type": "info"
        }

        progress_tracker._store_notifications(req.user_id, [notification])

        return {"message": "Reply processed successfully.", "ai_response": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/exercise/generate")
async def generate_exercise(user_id: str, category: str, topic: str = None):
    """Generate an exercise for the user after a discussion or learning session."""
    try:
        # Generate exercise using the appropriate chain
        if category == "career":
            chain = career_chain
        elif category == "business":
            chain = business_chain
        elif category == "education":
            chain = education_chain
        elif category == "finance":
            chain = financing_chain
        else:
            raise HTTPException(status_code=400, detail="Invalid category.")

        # Generate exercise prompt
        exercise_prompt = f"Generate a short exercise (5-10 minutes) for {category} learning. Topic: {topic or category}"

        history = retrieve_memory(user_id, category)
        user_name = get_user_name(user_id)

        output = chain.invoke({
            "history": history,
            "topic": category,
            "user_input": exercise_prompt,
            "user_name": user_name
        })

        exercise_content = output.content if hasattr(output, "content") else str(output)

        # Create exercise notification
        notification = {
            "title": f"{category.capitalize()} Exercise",
            "message": f"You have a new exercise to complete: {exercise_content[:100]}...",
            "type": "info"
        }

        progress_tracker._store_notifications(user_id, [notification])

        # Return exercise details
        return {
            "exercise_id": f"exercise_{int(datetime.now().timestamp())}",
            "content": exercise_content,
            "category": category,
            "time_limit": 600  # 10 minutes in seconds
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/exercise/submit")
async def submit_exercise(req: ExerciseSubmissionRequest):
    """Submit exercise answers for AI correction."""
    try:
        # Generate feedback using the appropriate chain
        if req.category == "career":
            chain = career_chain
        elif req.category == "business":
            chain = business_chain
        elif req.category == "education":
            chain = education_chain
        elif req.category == "finance":
            chain = financing_chain
        else:
            raise HTTPException(status_code=400, detail="Invalid category.")

        # Prepare submission prompt
        submission_prompt = f"Please review and provide feedback on the following exercise answers:\n\n{json.dumps(req.answers, indent=2)}\n\nTime taken: {req.time_taken} seconds"

        history = retrieve_memory(req.user_id, req.category)
        user_name = get_user_name(req.user_id)

        output = chain.invoke({
            "history": history,
            "topic": req.category,
            "user_input": submission_prompt,
            "user_name": user_name
        })

        feedback = output.content if hasattr(output, "content") else str(output)

        # Calculate score (simplified)
        score = min(100, max(0, 100 - (req.time_taken / 60)))  # Base score adjusted by time

        # Track progress
        progress_tracker.record_quiz_score(req.user_id, req.category, int(score), 10)

        # Create result notification
        notification = {
            "title": f"{req.category.capitalize()} Exercise Result",
            "message": f"Your exercise has been graded. Score: {score}/100\n\nFeedback: {feedback[:200]}...",
            "type": "success" if score >= 70 else "warning"
        }

        progress_tracker._store_notifications(req.user_id, [notification])

        return {
            "message": "Exercise submitted successfully.",
            "score": score,
            "feedback": feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/suggestions/{user_id}")
async def get_personalized_suggestions(user_id: str):
    """Generate personalized AI suggestions based on user's progress, CV, courses, and template."""
    try:
        # Get user information
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT name, template, cv_content FROM users WHERE user_id = ?
        ''', (user_id,))
        user_info = cursor.fetchone()
        
        if not user_info:
            raise HTTPException(status_code=404, detail="User not found")
        
        name, template, cv_content = user_info
        
        # Get education program info if template is education
        program_info = ""
        if template == "education":
            cursor.execute('''
                SELECT program_name FROM education_programs WHERE user_id = ?
            ''', (user_id,))
            program_result = cursor.fetchone()
            if program_result:
                program_info = program_result[0]
        
        conn.close()
        
        # Get user progress data
        progress_data = progress_tracker.get_user_progress(user_id)
        quiz_stats = progress_tracker.get_quiz_stats(user_id)

        # Analyze progress to identify strengths and weaknesses
        category_performance = {}
        for entry in progress_data:
            category = entry['category']
            score = entry['score']
            total_questions = entry['total_questions']

            if category not in category_performance:
                category_performance[category] = []
            category_performance[category].append({
                'score': score,
                'total_questions': total_questions,
                'percentage': (score / total_questions * 100) if total_questions > 0 else 0
            })

        # Calculate average performance per category
        performance_summary = {}
        for category, scores in category_performance.items():
            if scores:
                avg_percentage = sum(s['percentage'] for s in scores) / len(scores)
                performance_summary[category] = {
                    'average_score': avg_percentage,
                    'attempts': len(scores),
                    'latest_score': scores[-1]['percentage'] if scores else 0
                }

        # Determine user level based on performance for timetable generation
        user_level = "beginner"
        if performance_summary:
            avg_score = sum(cat['average_score'] for cat in performance_summary.values()) / len(performance_summary)
            if avg_score >= 85:
                user_level = "pro"
            elif avg_score >= 75:
                user_level = "advanced"
            elif avg_score >= 55:
                user_level = "intermediate"

        # Get current timetable content for personalized suggestions
        timetable_content = ""
        try:
            timetable_data = await generate_timetable(user_id, template, user_level)
            if timetable_data and timetable_data.get('content'):
                timetable_content = timetable_data['content'][:500]  # Limit to first 500 chars
        except Exception as e:
            print(f"Could not generate timetable for suggestions: {e}")
            timetable_content = "No current timetable available"
        
        # Generate AI-powered suggestions based on user data
        suggestions_prompt = f"""
        Based on the following user information, generate 8-10 personalized learning suggestions that would be most helpful for this user:

        User Name: {name}
        Template/Category: {template}
        CV Content: {cv_content[:1000] if cv_content else "No CV provided"}
        Education Program: {program_info if program_info else "Not specified"}

        Current Timetable: {timetable_content}

        Performance Summary:
        {json.dumps(performance_summary, indent=2)}

        Quiz Statistics:
        {json.dumps(quiz_stats, indent=2)}

        Please generate suggestions that:
        1. Address knowledge gaps based on their quiz performance
        2. Build on their existing strengths
        3. Are relevant to their template/category ({template})
        4. Consider their CV background and education program
        5. Align with their current timetable and learning schedule
        6. Help them progress in their learning journey
        7. Are practical and actionable

        Format each suggestion as a clear, concise question or topic they should explore.
        Focus on areas where they need improvement while leveraging their strengths and current learning plan.
        """
        
        # Use the appropriate AI chain based on template
        if template == "career":
            chain = career_chain
        elif template == "business":
            chain = business_chain
        elif template == "education":
            chain = education_chain
        elif template == "finance":
            chain = financing_chain
        else:
            # Default to career chain if template not recognized
            chain = career_chain
        
        history = retrieve_memory(user_id, template)
        user_name = get_user_name(user_id)
        
        output = chain.invoke({
            "history": history,
            "topic": template,
            "user_input": suggestions_prompt,
            "user_name": user_name
        })
        
        suggestions_text = output.content if hasattr(output, "content") else str(output)
        
        # Parse suggestions from AI response
        suggestions = []
        lines = suggestions_text.split('\n')
        
        for line in lines:
            line = line.strip()
            # Look for numbered suggestions or bullet points
            if (line and 
                (line[0].isdigit() or line.startswith('-') or line.startswith('•')) and 
                len(line) > 10):  # Filter out very short lines
                
                # Clean up the suggestion text
                clean_suggestion = line.lstrip('1234567890.-• ').strip()
                if clean_suggestion and len(clean_suggestion) > 15:  # Only meaningful suggestions
                    suggestions.append(clean_suggestion)
        
        # If AI didn't provide enough suggestions, add some template-based fallbacks
        if len(suggestions) < 5:
            fallback_suggestions = {
                "career": [
                    "How can I improve my resume based on my experience?",
                    "What are the current job market trends in my field?",
                    "How to prepare for technical interviews?",
                    "What skills should I develop for career advancement?",
                    "How to build a professional network effectively?"
                ],
                "business": [
                    "How to create a business plan for my idea?",
                    "What are effective marketing strategies for startups?",
                    "How to manage cash flow in a small business?",
                    "What are the key financial metrics to track?",
                    "How to build a strong company culture?"
                ],
                "education": [
                    "How to improve my study habits and time management?",
                    "What are effective note-taking techniques?",
                    "How to prepare for exams more efficiently?",
                    "What online learning resources would benefit me?",
                    "How to develop critical thinking skills?"
                ],
                "finance": [
                    "How to create a personal budget and stick to it?",
                    "What investment options are suitable for beginners?",
                    "How to improve my credit score?",
                    "What are strategies for paying off debt?",
                    "How to plan for retirement effectively?"
                ]
            }
            
            template_fallbacks = fallback_suggestions.get(template, fallback_suggestions["career"])
            suggestions.extend(template_fallbacks[:10 - len(suggestions)])
        
        # Limit to 10 suggestions maximum
        suggestions = suggestions[:10]
        
        return {
            "suggestions": suggestions,
            "user_info": {
                "name": name,
                "template": template,
                "performance_summary": performance_summary
            }
        }
        
    except Exception as e:
        print(f"Error generating suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")
