import sqlite3
import json
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Union
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class ProgressTracker:
    def __init__(self, db_path: str = 'user_progress.db'):
        self.db_path = db_path
        self.models = {}
        self.scalers = {}
        self._initialize_database()
        self._load_models()

    def _initialize_database(self):
        """Initialize the database with enhanced schema for template-specific tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enhanced user progress table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                score REAL NOT NULL,
                total_questions INTEGER DEFAULT 1,
                metrics_json TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Template-specific metrics tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS career_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                interview_score REAL,
                skill_assessment REAL,
                career_goal_progress REAL,
                resume_quality REAL,
                networking_score REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS business_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                business_plan_score REAL,
                market_analysis_score REAL,
                financial_projection_score REAL,
                pitch_quality REAL,
                strategy_score REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS education_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                learning_milestone_score REAL,
                concept_mastery REAL,
                study_efficiency REAL,
                knowledge_retention REAL,
                academic_performance REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS finance_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                investment_knowledge REAL,
                budgeting_skills REAL,
                financial_planning REAL,
                risk_assessment REAL,
                wealth_management REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Quiz questions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                question TEXT NOT NULL,
                user_answer TEXT NOT NULL,
                is_correct BOOLEAN NOT NULL,
                correct_answer TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Quiz answers table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                question_id TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, category, question_id)
            )
        ''')

        # Notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        conn.commit()
        conn.close()

    def _load_models(self):
        """Load pre-trained models or initialize new ones"""
        try:
            for category in ['career', 'business', 'education', 'finance']:
                try:
                    with open(f'model_{category}.pkl', 'rb') as f:
                        self.models[category] = pickle.load(f)
                    with open(f'scaler_{category}.pkl', 'rb') as f:
                        self.scalers[category] = pickle.load(f)
                except FileNotFoundError:
                    # Initialize new models if not found
                    self.models[category] = RandomForestRegressor(n_estimators=100, random_state=42)
                    self.scalers[category] = StandardScaler()
        except Exception as e:
            print(f"Error loading models: {e}")

    def save_models(self):
        """Save trained models to disk"""
        for category, model in self.models.items():
            with open(f'model_{category}.pkl', 'wb') as f:
                pickle.dump(model, f)
            with open(f'scaler_{category}.pkl', 'wb') as f:
                pickle.dump(self.scalers[category], f)

    def track_progress(self, user_id: str, category: str, score: float, 
                      total_questions: int = 1, metrics: Dict[str, Any] = None):
        """Track user progress with template-specific metrics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            metrics_json = json.dumps(metrics) if metrics else '{}'
            
            cursor.execute('''
                INSERT INTO user_progress (user_id, category, score, total_questions, metrics_json)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, category, score, total_questions, metrics_json))
            
            conn.commit()
            
            # Store template-specific metrics
            if metrics and category in ['career', 'business', 'education', 'finance']:
                self._store_template_metrics(user_id, category, metrics)
            
        except sqlite3.Error as e:
            print(f"Database error in track_progress: {e}")
        finally:
            if conn:
                conn.close()
        
        # Generate notifications for this progress update
        notifications = self.generate_all_notifications(user_id, category, score, metrics or {})
        
        # Store notifications in database
        self._store_notifications(user_id, notifications)
        
        # Retrain model with new data
        self.train_model(category)
        
        return notifications

    def _store_template_metrics(self, user_id: str, category: str, metrics: Dict[str, Any]):
        """Store template-specific metrics in dedicated tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if category == 'career':
                cursor.execute('''
                    INSERT INTO career_metrics (user_id, interview_score, skill_assessment, 
                                              career_goal_progress, resume_quality, networking_score)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    metrics.get('interview_score'),
                    metrics.get('skill_assessment'),
                    metrics.get('career_goal_progress'),
                    metrics.get('resume_quality'),
                    metrics.get('networking_score')
                ))
            
            elif category == 'business':
                cursor.execute('''
                    INSERT INTO business_metrics (user_id, business_plan_score, market_analysis_score,
                                                financial_projection_score, pitch_quality, strategy_score)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    metrics.get('business_plan_score'),
                    metrics.get('market_analysis_score'),
                    metrics.get('financial_projection_score'),
                    metrics.get('pitch_quality'),
                    metrics.get('strategy_score')
                ))
            
            elif category == 'education':
                cursor.execute('''
                    INSERT INTO education_metrics (user_id, learning_milestone_score, concept_mastery,
                                                 study_efficiency, knowledge_retention, academic_performance)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    metrics.get('learning_milestone_score'),
                    metrics.get('concept_mastery'),
                    metrics.get('study_efficiency'),
                    metrics.get('knowledge_retention'),
                    metrics.get('academic_performance')
                ))
            
            elif category == 'finance':
                cursor.execute('''
                    INSERT INTO finance_metrics (user_id, investment_knowledge, budgeting_skills,
                                               financial_planning, risk_assessment, wealth_management)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    metrics.get('investment_knowledge'),
                    metrics.get('budgeting_skills'),
                    metrics.get('financial_planning'),
                    metrics.get('risk_assessment'),
                    metrics.get('wealth_management')
                ))
            
            conn.commit()
        except sqlite3.Error as e:
            print(f"Database error in _store_template_metrics: {e}")
        finally:
            if conn:
                conn.close()

    def get_user_progress(self, user_id: str, category: str = None) -> List[Dict]:
        """Retrieve user progress data with optional category filter"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if category:
            cursor.execute('''
                SELECT category, score, total_questions, metrics_json, timestamp 
                FROM user_progress 
                WHERE user_id = ? AND category = ?
                ORDER BY timestamp
            ''', (user_id, category))
        else:
            cursor.execute('''
                SELECT category, score, total_questions, metrics_json, timestamp 
                FROM user_progress 
                WHERE user_id = ? 
                ORDER BY timestamp
            ''', (user_id,))
        
        progress_data = []
        for row in cursor.fetchall():
            progress_data.append({
                'category': row[0],
                'score': row[1],
                'total_questions': row[2],
                'metrics': json.loads(row[3]) if row[3] else {},
                'timestamp': row[4]
            })
        
        conn.close()
        return progress_data

    def get_template_metrics(self, user_id: str, category: str) -> Dict[str, Any]:
        """Get template-specific metrics for a user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if category == 'career':
            cursor.execute('''
                SELECT interview_score, skill_assessment, career_goal_progress, 
                       resume_quality, networking_score, timestamp
                FROM career_metrics 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 1
            ''', (user_id,))
        
        elif category == 'business':
            cursor.execute('''
                SELECT business_plan_score, market_analysis_score, financial_projection_score,
                       pitch_quality, strategy_score, timestamp
                FROM business_metrics 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 1
            ''', (user_id,))
        
        elif category == 'education':
            cursor.execute('''
                SELECT learning_milestone_score, concept_mastery, study_efficiency,
                       knowledge_retention, academic_performance, timestamp
                FROM education_metrics 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 1
            ''', (user_id,))
        
        elif category == 'finance':
            cursor.execute('''
                SELECT investment_knowledge, budgeting_skills, financial_planning,
                       risk_assessment, wealth_management, timestamp
                FROM finance_metrics 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 1
            ''', (user_id,))
        
        else:
            conn.close()
            return {}
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return {}
        
        if category == 'career':
            return {
                'interview_score': row[0],
                'skill_assessment': row[1],
                'career_goal_progress': row[2],
                'resume_quality': row[3],
                'networking_score': row[4],
                'timestamp': row[5]
            }
        elif category == 'business':
            return {
                'business_plan_score': row[0],
                'market_analysis_score': row[1],
                'financial_projection_score': row[2],
                'pitch_quality': row[3],
                'strategy_score': row[4],
                'timestamp': row[5]
            }
        elif category == 'education':
            return {
                'learning_milestone_score': row[0],
                'concept_mastery': row[1],
                'study_efficiency': row[2],
                'knowledge_retention': row[3],
                'academic_performance': row[4],
                'timestamp': row[5]
            }
        elif category == 'finance':
            return {
                'investment_knowledge': row[0],
                'budgeting_skills': row[1],
                'financial_planning': row[2],
                'risk_assessment': row[3],
                'wealth_management': row[4],
                'timestamp': row[5]
            }

    def train_model(self, category: str):
        """Train the ML model for a specific category"""
        try:
            
            conn = sqlite3.connect(self.db_path)
            
            if category in ['career', 'business', 'education', 'finance']:
                
                table_name = f"{category}_metrics"
                query = f'''
                    SELECT * FROM {table_name} 
                    WHERE user_id IN (SELECT DISTINCT user_id FROM {table_name})
                    ORDER BY timestamp
                '''
                df = pd.read_sql_query(query, conn)
            else:
               
                query = '''
                    SELECT score, total_questions FROM user_progress 
                    WHERE category = ? 
                    ORDER BY timestamp
                '''
                df = pd.read_sql_query(query, conn, params=(category,))
            
            conn.close()
            
            if len(df) < 5: 
                return
            
            if category in ['career', 'business', 'education', 'finance']:
                
                features = df.drop(['id', 'user_id', 'timestamp'], axis=1, errors='ignore')
                features = features.dropna()
                
                if len(features) < 2:
                    return
                
                
                target_col = features.columns[-1]
                X = features.drop(target_col, axis=1)
                y = features[target_col]
                
                
                X_scaled = self.scalers[category].fit_transform(X)
                
               
                self.models[category].fit(X_scaled, y)
            else:
                
                X = np.array(range(len(df))).reshape(-1, 1)
                y = df['score'].values
                
                if len(X) > 1:
                    model = LinearRegression()
                    model.fit(X, y)
                    self.models[category] = model
            
            self.save_models()
            
        except Exception as e:
            print(f"Error training model for {category}: {e}")

    def predict_progress(self, user_id: str, category: str, steps_ahead: int = 1) -> Dict[str, Any]:
        """Predict future progress with confidence intervals"""
        try:
            progress_data = self.get_user_progress(user_id, category)
            
            if not progress_data:
                return {
                    'predicted_score': 0.0,
                    'confidence_interval': (0.0, 0.0),
                    'trend': 'neutral',
                    'message': 'Insufficient data for prediction'
                }
            
            # Prepare data for prediction
            scores = [entry['score'] for entry in progress_data]
            timestamps = [entry['timestamp'] for entry in progress_data]
            
            if len(scores) < 3:
                # Simple average for small datasets
                avg_score = sum(scores) / len(scores)
                return {
                    'predicted_score': avg_score,
                    'confidence_interval': (avg_score * 0.8, avg_score * 1.2),
                    'trend': 'stable',
                    'message': 'Based on limited data'
                }
            
            # Use ML model for prediction if available
            if category in self.models and self.models[category] is not None:
                # Get template-specific metrics for enhanced prediction
                template_metrics = self.get_template_metrics(user_id, category)
                
                if template_metrics:
                    # Prepare features for prediction
                    features = list(template_metrics.values())[:-1]  # Exclude timestamp
                    features = [f for f in features if f is not None]
                    
                    if len(features) >= 2:
                        features_array = np.array(features).reshape(1, -1)
                        try:
                            features_scaled = self.scalers[category].transform(features_array)
                            prediction = self.models[category].predict(features_scaled)[0]
                            
                            # Calculate confidence interval (simplified)
                            std_dev = np.std(scores)
                            confidence_interval = (
                                max(0, prediction - std_dev),
                                min(100, prediction + std_dev)
                            )
                            
                            trend = 'improving' if prediction > scores[-1] else 'declining' if prediction < scores[-1] else 'stable'
                            
                            return {
                                'predicted_score': float(prediction),
                                'confidence_interval': confidence_interval,
                                'trend': trend,
                                'message': f'ML prediction based on {len(scores)} data points'
                            }
                        except Exception:
                            # Fallback to linear regression if scaler/model not properly fitted
                            pass
            
            # Fallback to linear regression
            X = np.array(range(len(scores))).reshape(-1, 1)
            y = np.array(scores)
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Predict next value
            next_x = np.array([[len(scores)]])
            prediction = model.predict(next_x)[0]
            
            # Calculate confidence interval
            residuals = y - model.predict(X)
            std_dev = np.std(residuals)
            confidence_interval = (
                max(0, prediction - 1.96 * std_dev),
                min(100, prediction + 1.96 * std_dev)
            )
            
            trend = 'improving' if prediction > scores[-1] else 'declining' if prediction < scores[-1] else 'stable'
            
            return {
                'predicted_score': float(prediction),
                'confidence_interval': confidence_interval,
                'trend': trend,
                'message': f'Linear regression based on {len(scores)} data points'
            }
            
        except Exception as e:
            print(f"Error predicting progress: {e}")
            return {
                'predicted_score': 0.0,
                'confidence_interval': (0.0, 0.0),
                'trend': 'unknown',
                'message': f'Prediction error: {str(e)}'
            }

    def get_overall_progress(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive progress overview across all categories"""
        categories = ['career', 'business', 'education', 'finance', 'quiz', 'chat']
        overall_progress = {}
        
        for category in categories:
            progress_data = self.get_user_progress(user_id, category)
            if progress_data:
                scores = [entry['score'] for entry in progress_data]
                overall_progress[category] = {
                    'current_score': scores[-1] if scores else 0,
                    'average_score': sum(scores) / len(scores) if scores else 0,
                    'total_attempts': len(scores),
                    'trend': self._calculate_trend(scores),
                    'prediction': self.predict_progress(user_id, category) if len(scores) >= 2 else None
                }
        
        return overall_progress

    def _calculate_trend(self, scores: List[float]) -> str:
        """Calculate trend based on recent scores"""
        if len(scores) < 2:
            return 'neutral'
        
        recent_scores = scores[-3:]  # Last 3 scores
        if len(recent_scores) < 2:
            return 'neutral'
        
        # Simple trend calculation
        if recent_scores[-1] > recent_scores[0]:
            return 'improving'
        elif recent_scores[-1] < recent_scores[0]:
            return 'declining'
        else:
            return 'stable'

    def record_quiz_question(self, user_id: str, category: str, question: str, 
                           user_answer: str, is_correct: bool, correct_answer: str = None):
        """Record individual quiz question results"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS quiz_questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    category TEXT NOT NULL,
                    question TEXT NOT NULL,
                    user_answer TEXT NOT NULL,
                    is_correct BOOLEAN NOT NULL,
                    correct_answer TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                INSERT INTO quiz_questions (user_id, category, question, user_answer, is_correct, correct_answer)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, category, question, user_answer, is_correct, correct_answer))
            
            conn.commit()
            conn.close()
            
            # Calculate score for progress tracking (1 for correct, 0 for incorrect)
            score = 100 if is_correct else 0
            self.track_progress(user_id, category, score, 1)
            
        except sqlite3.Error as e:
            print(f"Database error in record_quiz_question: {e}")

    def record_quiz_score(self, user_id: str, category: str, score: int, total_questions: int):
        """Record overall quiz score"""
        self.track_progress(user_id, category, score, total_questions)

    def record_conversation_metrics(self, user_id: str, category: str, message_count: int, avg_response_length: int):
        """Record conversation metrics"""
        # For now, we'll track conversation engagement as a simple metric
        # You can enhance this with more sophisticated metrics
        engagement_score = min(100, message_count * 10 + avg_response_length / 10)
        self.track_progress(user_id, category, engagement_score, 1)

    def get_quiz_questions(self, user_id: str, category: str = None) -> List[Dict]:
        """Get quiz questions history for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if category:
                cursor.execute('''
                    SELECT question, user_answer, is_correct, correct_answer, timestamp
                    FROM quiz_questions 
                    WHERE user_id = ? AND category = ?
                    ORDER BY timestamp DESC
                ''', (user_id, category))
            else:
                cursor.execute('''
                    SELECT question, user_answer, is_correct, correct_answer, timestamp
                    FROM quiz_questions 
                    WHERE user_id = ?
                    ORDER BY timestamp DESC
                ''', (user_id,))
            
            questions = []
            for row in cursor.fetchall():
                questions.append({
                    'question': row[0],
                    'user_answer': row[1],
                    'is_correct': bool(row[2]),
                    'correct_answer': row[3],
                    'timestamp': row[4]
                })
            
            conn.close()
            return questions
            
        except sqlite3.Error as e:
            print(f"Database error in get_quiz_questions: {e}")
            return []

    def get_quiz_stats(self, user_id: str, category: str = None) -> Dict[str, Any]:
        """Get quiz statistics for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if category:
                cursor.execute('''
                    SELECT 
                        COUNT(*) as total_questions,
                        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
                        AVG(CASE WHEN is_correct = 1 THEN 100.0 ELSE 0.0 END) as average_score
                    FROM quiz_questions 
                    WHERE user_id = ? AND category = ?
                ''', (user_id, category))
            else:
                cursor.execute('''
                    SELECT 
                        COUNT(*) as total_questions,
                        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
                        AVG(CASE WHEN is_correct = 1 THEN 100.0 ELSE 0.0 END) as average_score
                    FROM quiz_questions 
                    WHERE user_id = ?
                ''', (user_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if row and row[0] > 0:
                total_questions = row[0]
                correct_answers = row[1]
                accuracy = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
                average_score = row[2] if row[2] is not None else 0
                
                return {
                    'total_questions': total_questions,
                    'correct_answers': correct_answers,
                    'accuracy': round(accuracy, 2),
                    'average_score': round(average_score, 2)
                }
            else:
                return {
                    'total_questions': 0,
                    'correct_answers': 0,
                    'accuracy': 0.0,
                    'average_score': 0.0
                }
            
        except sqlite3.Error as e:
            print(f"Database error in get_quiz_stats: {e}")
            return {
                'total_questions': 0,
                'correct_answers': 0,
                'accuracy': 0.0,
                'average_score': 0.0
            }

    def generate_progress_notification(self, user_id: str, category: str, score: float, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a progress notification based on user performance."""
        progress_data = self.get_user_progress(user_id, category)
        
        if not progress_data:
            return {
                "title": f"Welcome to {category.capitalize()} Learning!",
                "message": f"You've started your {category} learning journey. Your first score: {score}%",
                "type": "info"
            }
        
        # Calculate improvement
        previous_score = progress_data[-1]['score'] if len(progress_data) > 1 else score
        improvement = score - previous_score
        
        if improvement > 10:
            return {
                "title": f"Great Progress in {category.capitalize()}!",
                "message": f"Your {category} score improved by {improvement:.1f}%! Keep up the great work!",
                "type": "success"
            }
        elif improvement > 0:
            return {
                "title": f"Steady Progress in {category.capitalize()}",
                "message": f"Your {category} score improved by {improvement:.1f}%. Consistent progress leads to success!",
                "type": "info"
            }
        elif improvement < -5:
            return {
                "title": f"Focus Needed in {category.capitalize()}",
                "message": f"Your {category} score decreased by {abs(improvement):.1f}%. Let's review the concepts together.",
                "type": "warning"
            }
        else:
            return {
                "title": f"{category.capitalize()} Performance Update",
                "message": f"Your current {category} score: {score}%. Ready for the next challenge?",
                "type": "info"
            }

    def generate_learning_insight_notification(self, user_id: str, category: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate learning insights based on performance metrics."""
        if category == "career":
            if metrics.get('interview_score', 0) > 85:
                return {
                    "title": "Interview Skills Excellence!",
                    "message": "Your interview performance is outstanding! You're well-prepared for real interviews.",
                    "type": "success"
                }
            elif metrics.get('skill_assessment', 0) < 70:
                return {
                    "title": "Skill Development Opportunity",
                    "message": "Focus on developing your core skills. Practice makes perfect!",
                    "type": "info"
                }
                
        elif category == "business":
            if metrics.get('business_plan_score', 0) > 80:
                return {
                    "title": "Business Planning Mastery",
                    "message": "Your business planning skills are excellent! You understand market dynamics well.",
                    "type": "success"
                }
                
        elif category == "education":
            if metrics.get('concept_mastery', 0) > 75:
                return {
                    "title": "Concept Mastery Achieved",
                    "message": "You've mastered key concepts! Ready to tackle more advanced topics.",
                    "type": "success"
                }
                
        elif category == "finance":
            if metrics.get('investment_knowledge', 0) > 80:
                return {
                    "title": "Investment Knowledge Strong",
                    "message": "Your investment knowledge is impressive! You make sound financial decisions.",
                    "type": "success"
                }
                
        return None

    def generate_milestone_notification(self, user_id: str, category: str) -> Dict[str, Any]:
        """Generate milestone notifications based on user progress."""
        progress_data = self.get_user_progress(user_id, category)
        total_attempts = len(progress_data)
        
        milestones = {
            5: "You've completed 5 learning sessions! Consistency is key to success.",
            10: "10 sessions completed! You're building strong learning habits.",
            20: "20 sessions milestone reached! Your dedication is paying off.",
            50: "50 sessions completed! You're on an incredible learning journey."
        }
        
        if total_attempts in milestones:
            return {
                "title": f"{category.capitalize()} Learning Milestone!",
                "message": milestones[total_attempts],
                "type": "success"
            }
        
        return None

    def _store_notifications(self, user_id: str, notifications: List[Dict[str, Any]]):
        """Store notifications in the database"""
        if not notifications:
            return
            
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create notifications table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT NOT NULL,
                    read BOOLEAN DEFAULT FALSE,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Insert notifications
            for notification in notifications:
                cursor.execute('''
                    INSERT INTO user_notifications (user_id, title, message, type)
                    VALUES (?, ?, ?, ?)
                ''', (
                    user_id,
                    notification['title'],
                    notification['message'],
                    notification['type']
                ))
            
            conn.commit()
            conn.close()
            
        except sqlite3.Error as e:
            print(f"Database error in _store_notifications: {e}")

    def generate_all_notifications(self, user_id: str, category: str, score: float, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate all relevant notifications for user progress."""
        notifications = []
        
        # Progress notification
        progress_notification = self.generate_progress_notification(user_id, category, score, metrics)
        if progress_notification:
            notifications.append(progress_notification)
        
        # Learning insight notification
        insight_notification = self.generate_learning_insight_notification(user_id, category, metrics)
        if insight_notification:
            notifications.append(insight_notification)
        
        # Milestone notification
        milestone_notification = self.generate_milestone_notification(user_id, category)
        if milestone_notification:
            notifications.append(milestone_notification)
        
        return notifications

    def get_user_notifications(self, user_id: str, unread_only: bool = False) -> List[Dict[str, Any]]:
        """Get notifications for a user, optionally filtered by read status"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if unread_only:
                cursor.execute('''
                    SELECT id, title, message, type, read, timestamp 
                    FROM user_notifications 
                    WHERE user_id = ? AND read = FALSE
                    ORDER BY timestamp DESC
                ''', (user_id,))
            else:
                cursor.execute('''
                    SELECT id, title, message, type, read, timestamp 
                    FROM user_notifications 
                    WHERE user_id = ?
                    ORDER BY timestamp DESC
                ''', (user_id,))
            
            notifications = []
            for row in cursor.fetchall():
                notifications.append({
                    'id': str(row[0]),  # Convert to string to match frontend interface
                    'title': row[1],
                    'message': row[2],
                    'type': row[3],
                    'read': bool(row[4]),
                    'timestamp': row[5]
                })
            
            conn.close()
            return notifications
            
        except sqlite3.Error as e:
            print(f"Database error in get_user_notifications: {e}")
            return []

    def mark_notification_as_read(self, notification_id: int):
        """Mark a notification as read"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('''
                UPDATE user_notifications
                SET read = TRUE
                WHERE id = ?
            ''', (notification_id,))

            conn.commit()
            conn.close()

        except sqlite3.Error as e:
            print(f"Database error in mark_notification_as_read: {e}")

    def store_quiz_answers(self, user_id: str, category: str, correct_answers: Dict[str, str]):
        """Store correct answers for a quiz session"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Create quiz_answers table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS quiz_answers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    category TEXT NOT NULL,
                    question_id TEXT NOT NULL,
                    correct_answer TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, category, question_id)
                )
            ''')

            # Store correct answers
            for question_id, correct_answer in correct_answers.items():
                cursor.execute('''
                    INSERT OR REPLACE INTO quiz_answers (user_id, category, question_id, correct_answer)
                    VALUES (?, ?, ?, ?)
                ''', (user_id, category, question_id, correct_answer))

            conn.commit()
            conn.close()

        except sqlite3.Error as e:
            print(f"Database error in store_quiz_answers: {e}")

    def get_correct_answers(self, user_id: str, category: str) -> Dict[str, str]:
        """Retrieve correct answers for a user's quiz session"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('''
                SELECT question_id, correct_answer
                FROM quiz_answers
                WHERE user_id = ? AND category = ?
                ORDER BY timestamp DESC
            ''', (user_id, category))

            correct_answers = {}
            for row in cursor.fetchall():
                correct_answers[row[0]] = row[1]

            conn.close()
            return correct_answers

        except sqlite3.Error as e:
            print(f"Database error in get_correct_answers: {e}")
            return {}

    def train_prediction_model(self):
        """Train the prediction model for all categories"""
        for category in ['career', 'business', 'education', 'finance']:
            self.train_model(category)

# Global instance for easy import
progress_tracker = ProgressTracker()

if __name__ == "__main__":
    # Initialize database when run directly
    progress_tracker._initialize_database()
    print("Database initialized successfully")
    
    # Test with sample data
    sample_metrics = {
        'career': {
            'interview_score': 85,
            'skill_assessment': 78,
            'career_goal_progress': 90,
            'resume_quality': 82,
            'networking_score': 75
        },
        'business': {
            'business_plan_score': 88,
            'market_analysis_score': 76,
            'financial_projection_score': 82,
            'pitch_quality': 79,
            'strategy_score': 85
        }
    }
    
    # Add sample progress
    for category, metrics in sample_metrics.items():
        progress_tracker.track_progress('test_user', category, 80, 10, metrics)
    
    print("Sample data added")
    print("Career prediction:", progress_tracker.predict_progress('test_user', 'career'))
    print("Overall progress:", progress_tracker.get_overall_progress('test_user'))
