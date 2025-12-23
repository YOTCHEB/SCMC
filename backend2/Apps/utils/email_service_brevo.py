import os
import requests
import random
import string
from datetime import datetime, timedelta
from typing import Optional
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BrevoSMTPService:
    def __init__(self):
        self.api_key = os.getenv('BREVO_API_KEY')
        self.from_email = os.getenv('BREVO_FROM_EMAIL', 'yotchebkandolojean@gmail.com')
        self.from_name = os.getenv('BREVO_FROM_NAME', 'YOTLAB-WEBG')
        self.api_url = "https://api.brevo.com/v3/smtp/email"

    def is_configured(self) -> bool:
        """Check if Brevo is properly configured"""
        return bool(self.api_key)

    def generate_confirmation_code(self, length: int = 6) -> str:
        """Generate a random confirmation code"""
        return ''.join(random.choices(string.digits, k=length))

    def send_confirmation_email(self, email: str, user_name: str, confirmation_code: str, card_id: Optional[str] = None) -> bool:
        """
        Send confirmation email using Brevo SMTP API
        """
        if not self.is_configured():
            logger.warning("Brevo API not configured. Email sending disabled.")
            return False

        try:
           
            html_content = self._generate_email_html(user_name, confirmation_code, card_id)
            text_content = self._generate_email_text(user_name, confirmation_code, card_id)

            
            payload = {
                "sender": {
                    "name": self.from_name,
                    "email": self.from_email
                },
                "to": [{
                    "email": email,
                    "name": user_name
                }],
                "subject": "Confirm Your Account",
                "htmlContent": html_content,
                "textContent": text_content
            }

            
            headers = {
                "accept": "application/json",
                "api-key": self.api_key,
                "content-type": "application/json"
            }

            response = requests.post(self.api_url, json=payload, headers=headers)

            if response.status_code == 201:
                logger.info(f"Confirmation email sent to {email} via Brevo")
                return True
            else:
                logger.error(f"Failed to send email via Brevo: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Failed to send email via Brevo: {e}")
            return False

    def _generate_email_html(self, user_name: str, confirmation_code: str, card_id: Optional[str] = None) -> str:
        """Generate a professional HTML email content"""
        card_info = f"<p style='font-size:16px;'>Your Student ID Number is: <strong>{card_id}</strong></p>" if card_id else ""

        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SCMC Confirmation Code</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #ffffff;
                    padding: 40px 20px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    letter-spacing: 1px;
                }}
                .header p {{
                    margin-top: 8px;
                    font-size: 16px;
                    opacity: 0.9;
                }}
                .content {{
                    padding: 30px 25px;
                    line-height: 1.6;
                }}
                .content h2 {{
                    font-size: 22px;
                    color: #333;
                }}
                .content p {{
                    font-size: 16px;
                    color: #555;
                }}
                .code {{
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 4px;
                    color: #667eea;
                    text-align: center;
                    margin: 25px 0;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 10px;
                    border: 2px dashed #d1d5db;
                    box-shadow: inset 0 0 10px rgba(102,126,234,0.1);
                }}
                .footer {{
                    text-align: center;
                    padding: 20px 15px;
                    font-size: 12px;
                    color: #888;
                    background-color: #f4f6f8;
                }}
                .footer p {{
                    margin: 4px 0;
                }}
                @media screen and (max-width: 620px) {{
                    .header h1 {{
                        font-size: 24px;
                    }}
                    .header p, .content p {{
                        font-size: 14px;
                    }}
                    .code {{
                        font-size: 24px;
                        padding: 15px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>YOTLAB-WEB</h1>
                    <p>Your Personalized Learning Journey Starts Here</p>
                </div>
                <div class="content">
                    <h2>Hello {user_name}!</h2>
                    <p>Thank you for registering with YOTLAB-WEBG. To complete your registration and access your personalized learning dashboard, please use the confirmation code below:</p>
                    <div class="code">{confirmation_code}</div>
                    {card_info}
                    <p>This code will expire in <strong>15 minutes</strong> for security reasons.</p>
                    <p>Enter this code in the confirmation form to verify your email address and activate your account.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 YOTLAB-WEBG. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """


    def _generate_email_text(self, user_name: str, confirmation_code: str, card_id: Optional[str] = None) -> str:
        """Generate plain text email content"""
        card_info = f"\nYour Student ID Number is: {card_id}\n" if card_id else ""
        return f"""
        Student Career Mentor - Account Confirmation

        Hello {user_name}!

        Thank you for registering with Student Career Mentor. To complete your registration and access your personalized learning dashboard, please use the confirmation code below:

        Confirmation Code: {confirmation_code}
        {card_info}
        This code will expire in 15 minutes for security reasons.

        Enter this code in the confirmation form to verify your email address and activate your account.

        If you didn't create this account, please ignore this email.

        ---
        Student Career Mentor
        This is an automated message, please do not reply to this email.
        """

class EmailService:
    def __init__(self):
        self.brevo = BrevoSMTPService()

    def send_confirmation_email(self, email: str, user_name: str, confirmation_code: str, card_id: Optional[str] = None) -> bool:
        return self.brevo.send_confirmation_email(email, user_name, confirmation_code, card_id)

    def verify_confirmation_code(self, stored_code: str, user_code: str) -> bool:
        return stored_code == user_code


email_service = EmailService()


def generate_confirmation_code_expiry(minutes: int = 15) -> datetime:
    return datetime.now() + timedelta(minutes=minutes)

def is_confirmation_code_expired(expiry_time: datetime) -> bool:
    return datetime.now() > expiry_time
