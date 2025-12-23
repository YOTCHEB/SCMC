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

### AG Component

1. Navigate to the AG directory:
```bash
cd AG
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the backend server
2. Start the UI development server
3. Access the application through your web browser
4. Use the AG component for agricultural-specific features

## Database

The application uses SQLite with a database file named `user_progress.db` for tracking user progress and related data.

## Configuration

- Backend configuration is typically handled through the `.env` file in the backend2 directory
- UI configuration can be managed through environment variables or configuration files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Specify your license here - e.g., MIT, Apache 2.0, etc.]

## Contact

[Add contact information, maintainers, or support channels here]