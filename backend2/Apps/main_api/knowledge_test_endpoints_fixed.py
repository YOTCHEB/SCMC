from fastapi import HTTPException
from typing import Dict, Any
from datetime import datetime
from Apps.template.prompts import (
    career_chain,
    business_chain,
    education_chain,
    financing_chain,
    update_memory,
    retrieve_memory,
    get_user_name,
    get_db_connection
)

from Apps.progress_tracker import progress_tracker
import re

async def generate_quiz(user_id: str, category: str, num_questions: int = 5):
    """Generate a knowledge assessment quiz strictly based on user profile and category"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT name, cv_content, program_name FROM users
            LEFT JOIN education_programs ON users.user_id = education_programs.user_id
            WHERE users.user_id = ?
        ''', (user_id,))
        user_info = cursor.fetchone()
        conn.close()

        if not user_info:
            raise HTTPException(status_code=404, detail="User not found")

        name, cv_content, program_name = user_info

        # Create a specific prompt for quiz generation
        if category == "career" and cv_content:
            quiz_prompt = f"""Generate {num_questions} multiple choice questions to assess career knowledge based on this CV content: {cv_content[:1000]}.

Format each question as:
1. Question text here?
A) Option A
B) Option B
C) Option C
D) Option D

2. Next question...

Make sure to provide exactly 4 options (A, B, C, D) for each question."""
        elif category == "education" and program_name:
            quiz_prompt = f"""Generate {num_questions} multiple choice questions to assess knowledge in {program_name} for beginners.

Format each question as:
1. Question text here?
A) Option A
B) Option B
C) Option C
D) Option D

2. Next question...

Make sure to provide exactly 4 options (A, B, C, D) for each question."""
        else:
            quiz_prompt = f"""Generate {num_questions} multiple choice questions to assess {category} knowledge for beginners.

Format each question as:
1. Question text here?
A) Option A
B) Option B
C) Option C
D) Option D

2. Next question...

Make sure to provide exactly 4 options (A, B, C, D) for each question."""

        # Use a simple LLM call instead of the chain for structured output
        from Apps.Model.nlp import MCMC
        quiz_content = MCMC.ask(quiz_prompt)

        questions = []
        current_question = None

        for line in quiz_content.split('\n'):
            line = line.strip()

            if re.match(r'^\d+[\).]', line) or line.lower().startswith("question"):
                if current_question:
                    questions.append(current_question)
                q_text = re.sub(r'^\d+[\).]\s*', '', line)
                current_question = {
                    "id": f"q{len(questions) + 1}",
                    "question": q_text.strip(),
                    "options": [],
                    "type": "multiple",
                    "correct_answer": None  # Will be set to first option by default
                }

            elif re.match(r'^[A-D][\).]', line) and current_question:
                option_text = re.sub(r'^[A-D][\).]\s*', '', line)
                current_question["options"].append(option_text.strip())
                # Set first option as correct answer (simplified approach)
                if current_question["correct_answer"] is None:
                    current_question["correct_answer"] = option_text.strip()

        if current_question:
            questions.append(current_question)

        if not questions:
            raise HTTPException(status_code=500, detail="AI failed to generate questions")

        # Store correct answers in progress tracker for later retrieval
        correct_answers = {q["id"]: q["correct_answer"] for q in questions}
        progress_tracker.store_quiz_answers(user_id, category, correct_answers)

        return questions

    except Exception as e:
        print(f"DEBUG: Exception in generate_quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")


async def submit_quiz_answers(user_id: str, category: str, answers: Dict[str, Any]):
    """Submit quiz answers and calculate score"""
    try:
        # Retrieve correct answers from progress tracker or database
        correct_answers_data = progress_tracker.get_correct_answers(user_id, category)
        total_questions = len(answers)
        correct_count = 0

        for qid, user_answer in answers.items():
            correct_answer = correct_answers_data.get(qid)
            if correct_answer and user_answer.strip().lower() == correct_answer.strip().lower():
                correct_count += 1

        score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0

        progress_tracker.record_quiz_score(user_id, category, score, total_questions)

        user_level = "beginner" if score < 55 else "intermediate"
        timetable = None
        if score < 55:
            timetable = await generate_timetable(user_id, category, user_level)

        return {
            "score": score,
            "total_questions": total_questions,
            "correct_answers": correct_count,
            "user_level": user_level,
            "timetable": timetable
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit answers: {str(e)}")


async def generate_timetable(user_id: str, category: str, level: str):
    """Generate a personalized timetable for the user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT name, program_name, daily_schedule FROM users
            LEFT JOIN education_programs ON users.user_id = education_programs.user_id
            WHERE users.user_id = ?
        ''', (user_id,))
        user_info = cursor.fetchone()
        conn.close()

        if not user_info:
            return None

        name, program_name, daily_schedule = user_info

        coding_note = ""
        if level in ["advanced", "pro"]:
            coding_note = " Include coding sessions and advanced programming exercises appropriate for the user's level."
        timetable_prompt = f"""
        Generate a weekly timetable for {name} who is a {level} level student in {category}.
        Program: {program_name or category}
        Daily schedule preference: {daily_schedule or '9 AM - 5 PM'}
        Include study sessions, breaks, and practical exercises.{coding_note}
        """

        chain_map = {
            "career": career_chain,
            "business": business_chain,
            "education": education_chain,
            "finance": financing_chain
        }
        chain = chain_map.get(category)
        if not chain:
            return None

        history = retrieve_memory(user_id, category)
        user_name = get_user_name(user_id)

        output = chain.invoke({
            "history": history,
            "topic": category,
            "user_input": timetable_prompt,
            "user_name": user_name
        })

        timetable_content = output.content if hasattr(output, "content") else str(output)

        return {
            "content": timetable_content,
            "level": level,
            "category": category,
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"DEBUG: Failed to generate timetable: {str(e)}")
        return None
