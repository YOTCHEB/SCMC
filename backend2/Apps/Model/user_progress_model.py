import sqlite3
from typing import List, Dict

class UserProgressModel:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_user_progress(self, user_id: str) -> List[Dict]:
        """Retrieve user progress data from the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT quiz_score, timestamp FROM user_progress WHERE user_id = ?", (user_id,))
        progress_data = cursor.fetchall()
        conn.close()
        return [{"score": row[0], "timestamp": row[1]} for row in progress_data]

    def add_user_progress(self, user_id: str, quiz_score: int):
        """Add a new entry for user progress in the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO user_progress (user_id, quiz_score) VALUES (?, ?)", (user_id, quiz_score))
        conn.commit()
        conn.close()

    def predict_progress(self, user_id: str) -> float:
        """Predict user progress based on historical data."""
        progress_data = self.get_user_progress(user_id)
        if not progress_data:
            return 0.0  # No data to predict from

        # Simple prediction logic (e.g., average score)
        total_score = sum(entry['score'] for entry in progress_data)
        average_score = total_score / len(progress_data)
        return average_score

if __name__ == "__main__":
    model = UserProgressModel('user_progress.db')
    # Example usage
    print(model.get_user_progress('user123'))
    model.add_user_progress('user123', 85)
    print(model.predict_progress('user123'))
