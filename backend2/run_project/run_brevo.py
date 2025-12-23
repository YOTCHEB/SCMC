import os
import sys

project = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not project in sys.path:
    sys.path.append(project)

try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(env_path)
    print("Environment variables loaded from .env file")
except ImportError:
    print("python-dotenv not installed. Install with: pip install python-dotenv")
    print("Or set environment variables manually")

import uvicorn

if __name__=="__main__":
    uvicorn.run("Apps.main_api.main_brevo:app",host="0.0.0.0",port=8000,reload=True)
    
