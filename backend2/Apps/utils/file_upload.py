import os
import uuid
from datetime import datetime
from typing import Optional, Tuple
import sqlite3
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FileUploadService:
    def __init__(self):
        self.upload_dir = "uploads"
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_extensions = {'.pdf', '.doc', '.docx', '.txt'}

        
        os.makedirs(self.upload_dir, exist_ok=True)

    def is_valid_file(self, filename: str, content: bytes) -> Tuple[bool, str]:
        """Validate file type and size"""
        
        if len(content) > self.max_file_size:
            return False, f"File size exceeds {self.max_file_size // (1024*1024)}MB limit"

        
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext not in self.allowed_extensions:
            return False, f"File type not allowed. Allowed types: {', '.join(self.allowed_extensions)}"

        return True, "Valid file"

    def generate_unique_filename(self, original_filename: str) -> str:
        """Generate a unique filename to avoid conflicts"""
        ext = os.path.splitext(original_filename)[1]
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{ext}"

    def save_file(self, file_content: bytes, filename: str) -> Optional[str]:
        """Save file to disk and return the file path"""
        try:
            file_path = os.path.join(self.upload_dir, filename)
            with open(file_path, 'wb') as f:
                f.write(file_content)
            return file_path
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            return None

    def read_file_content(self, file_path: str) -> Optional[str]:
        """Read and return file content as text (for text-based files)"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file content: {e}")
            return None

    def save_cv_file(self, file_content: bytes, user_id: str, filename: str) -> Optional[str]:
        """Save CV file with unique name"""
        try:
            unique_filename = self.generate_unique_filename(filename)
            return self.save_file(file_content, unique_filename)
        except Exception as e:
            logger.error(f"Error saving CV file: {e}")
            return None

    def extract_text_from_cv(self, file_path: str) -> Optional[str]:
        """Extract text content from CV file"""
        return self.read_file_content(file_path)

class CVStorage:
    def __init__(self):
        self.file_service = FileUploadService()
        self.db_path = "user_progress.db"

    def store_cv(self, user_id: str, filename: str, file_content: bytes) -> Tuple[bool, str]:
        """Store CV file and metadata in database"""
        try:
         
            is_valid, message = self.file_service.is_valid_file(filename, file_content)
            if not is_valid:
                return False, message

            
            unique_filename = self.file_service.generate_unique_filename(filename)
            file_path = self.file_service.save_file(file_content, unique_filename)

            if not file_path:
                return False, "Failed to save file"

            
            file_content_text = None
            if filename.lower().endswith(('.txt', '.pdf', '.doc', '.docx')):
                file_content_text = self.file_service.read_file_content(file_path)

            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO users (user_id, cv_file_path, cv_content)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                cv_file_path = excluded.cv_file_path,
                cv_content = excluded.cv_content
            ''', (user_id, file_path, file_content_text))

            conn.commit()
            conn.close()

            logger.info(f"CV stored for user {user_id}: {file_path}")
            return True, "CV uploaded successfully"

        except Exception as e:
            logger.error(f"Error storing CV: {e}")
            return False, f"Error storing CV: {str(e)}"

    def get_cv_info(self, user_id: str) -> Optional[dict]:
        """Get CV information for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('''
                SELECT cv_file_path, cv_content FROM users WHERE user_id = ?
            ''', (user_id,))

            result = cursor.fetchone()
            conn.close()

            if result and result[0]:
                return {
                    'file_path': result[0],
                    'content_preview': result[1][:500] + '...' if result[1] and len(result[1]) > 500 else result[1] if result[1] else None
                }
            return None

        except Exception as e:
            logger.error(f"Error getting CV info: {e}")
            return None

    def delete_cv(self, user_id: str) -> bool:
        """Delete CV file and remove from database"""
        try:
           
            cv_info = self.get_cv_info(user_id)
            if cv_info and cv_info['file_path']:
                
                if os.path.exists(cv_info['file_path']):
                    os.remove(cv_info['file_path'])

            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute('''
                UPDATE users SET cv_file_path = NULL, cv_content = NULL WHERE user_id = ?
            ''', (user_id,))

            conn.commit()
            conn.close()

            logger.info(f"CV deleted for user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Error deleting CV: {e}")
            return False


cv_storage = CVStorage()
file_upload_service = FileUploadService()

def validate_file_upload(file, max_size_mb: int = 10) -> Tuple[bool, str]:
    """Validate uploaded file"""
    if not file:
        return False, "No file provided"

    if file.size > max_size_mb * 1024 * 1024:
        return False, f"File size exceeds {max_size_mb}MB limit"

    allowed_extensions = {'.pdf', '.doc', '.docx', '.txt'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        return False, f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"

    return True, "File valid"

def save_cv_file(file_content: bytes, user_id: str, filename: str) -> Optional[str]:
    """Save CV file and return file path"""
    return file_upload_service.save_cv_file(file_content, user_id, filename)

def extract_text_from_cv(file_path: str) -> Optional[str]:
    """Extract text content from CV file"""
    return file_upload_service.extract_text_from_cv(file_path)
