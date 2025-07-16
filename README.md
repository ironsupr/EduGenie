# EduGenie - AI-Powered Learning Platform

A modern learning management system built with React, TypeScript, and Firebase.

## Features

- 🔐 User Authentication (Sign up, Sign in, Profile management)
- 📚 Course Management System
- 🎯 Interactive Quizzes and Assessments
- 📊 Study Plan Generation
- 💬 Discussion Forums
- 📱 Responsive Design
- 🔥 Firebase Backend Integration

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (optional for development)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ironsupr/EduGenie
cd edugenie-learning-platform
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - For development, you can use the demo values provided
   - For production, replace with your actual Firebase configuration

### Firebase Setup (Optional)

For full functionality, you'll need to set up a Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Storage
6. Copy your config from Project Settings > General > Your apps
7. Update `.env.local` with your actual Firebase configuration
8. Update check-duplicates.js with valid credentials
9. Update remove-duplicates.js with valid credentials

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services (Firebase)
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── styles/             # CSS and styling
```

## Key Components

- **AuthContext**: Manages user authentication state
- **AuthModal**: Login/signup modal component
- **Navbar**: Navigation component
- **Firebase Services**: Handle authentication, courses, quizzes, etc.

## Environment Variables

The following environment variables are used:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Demo Mode

The app can run in demo mode without a real Firebase project. It includes:

- Demo configuration values
- Placeholder data
- All UI components functional
- Authentication flow (will show errors for actual signup/login)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
