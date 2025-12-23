# SCMC Project

## Overview

The SCMC (Supply Chain Management and Communication) Project is a comprehensive application designed to manage and track progress across multiple components. The project includes a modern React-based frontend, a Python backend API, and specialized modules for various functionalities including agricultural linkages in Malawi (AG component).

## Project Structure

```
SCMC-Project/
├── UI/                   # React/TypeScript frontend
├── backend2/             # Python backend API
├── AG/                   # Agricultural linkages component (agrolink-malawi)
├── uploads/              # Upload directory for file handling
├── user_progress.db      # SQLite database for user progress tracking
└── README.md             # This file
```

### UI (Frontend)
- Built with React, TypeScript, and Vite
- Styled using Tailwind CSS
- Includes routing with React Router
- Uses various UI libraries including Heroicons and Lucide React
- Built as a modern, responsive web application

### Backend (API)
- Python-based backend using FastAPI or similar framework
- Contains API endpoints for knowledge testing and communication
- Includes progress tracking functionality
- Uses SQLite database for storing user progress

### AG Component
- Specialized module for agricultural linkages in Malawi
- Built with React and Material UI icons
- Contains specific functionality for agricultural supply chains

## Features

- **Progress Tracking**: Built-in progress tracking for users
- **Knowledge Testing**: Endpoints for knowledge assessment
- **Responsive UI**: Modern, responsive user interface
- **File Uploads**: Support for file handling and uploads
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