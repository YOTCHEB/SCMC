# SCMC Project

## Overview

The SCMC (Student Career Mentor ChatBot) Project is a comprehensive career guidance application designed to assist students in their career development journey. The project includes a modern React-based frontend, a Python backend API, and various specialized modules for career guidance functionalities.

## Project Structure

```
SCMC-Project/
├── UI/                   # React/TypeScript frontend for the chatbot interface
├── backend2/             # Python backend API for chatbot logic
├── uploads/              # Upload directory for document handling
├── user_progress.db      # SQLite database for user progress tracking
└── README.md             # This file
```

### UI (Frontend)
- Built with React, TypeScript, and Vite
- Styled using Tailwind CSS
- Includes routing with React Router
- Uses various UI libraries including Heroicons and Lucide React
- Provides an intuitive interface for the career mentor chatbot

### Backend (API)
- Python-based backend using FastAPI or similar framework
- Contains API endpoints for chatbot interactions and career guidance
- Includes progress tracking functionality for career development
- Uses SQLite database for storing user progress and interactions


## Features

- **Career Guidance**: Personalized career advice and recommendations
- **Progress Tracking**: Built-in progress tracking for career development
- **Knowledge Testing**: Assessments to help students understand career paths
- **Interactive Chatbot**: Conversational interface for mentorship
- **Responsive UI**: Modern, responsive user interface
- **File Uploads**: Support for resume and document uploads
- **Multi-component Architecture**: Modular design for scalability

## Prerequisites

- Node.js (for UI development)
- Python (for backend development)
- SQLite (for database)
- npm or yarn (for UI dependencies)

## Installation

### Frontend (UI)

1. Navigate to the UI directory:
```bash
cd UI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Backend

1. Navigate to the backend directory:
```bash
cd backend2
```

2. Set up your Python environment (preferably using a virtual environment):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies (if requirements.txt exists):
```bash
pip install -r requirements.txt
```

4. Start the backend server (the exact command may depend on your backend setup):
```bash
# Usually something like:
python -m uvicorn main_api.main:app --reload
```



## Contact

[Add contact information, maintainers, or support channels here]
