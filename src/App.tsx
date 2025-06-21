import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import NewCourses from './pages/NewCourses';
import SuperSimpleCourses from './pages/SuperSimpleCourses';
import CreateCourse from './pages/CreateCourse';
import YouTubeImporter from './pages/YouTubeImporter';
import AdminPanel from './pages/AdminPanel';
import UniversityExam from './pages/UniversityExam';
import CourseLearning from './pages/CourseLearning';
import Quiz from './pages/Quiz';
import TestPage from './TestPage';
import DebugCourses from './components/DebugCourses';
import SimpleFirebaseTest from './components/SimpleFirebaseTest';
import SimpleCoursesList from './components/SimpleCoursesList';
import DirectFirebaseTest from './components/DirectFirebaseTest';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/debug-courses" element={<DebugCourses />} />
            <Route path="/firebase-test" element={<SimpleFirebaseTest />} />
            <Route path="/simple-courses" element={<SimpleCoursesList />} />
            <Route path="/direct-test" element={<DirectFirebaseTest />} />
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<SuperSimpleCourses />} />
            <Route path="/courses-new" element={<NewCourses />} />
            <Route path="/courses-old" element={<Courses />} />
            <Route path="/courses/create" element={<CreateCourse />} />
            <Route path="/youtube-import" element={<YouTubeImporter />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/university-exam" element={<UniversityExam />} />
            <Route path="/course/:courseId" element={<CourseLearning />} />
            <Route path="/quiz/:moduleId" element={<Quiz />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;