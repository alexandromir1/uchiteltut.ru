import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import TeacherProfile from './pages/TeacherProfile';
import SchoolProfile from './pages/SchoolProfile';
import TeacherDashboard from './pages/TeacherDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import MyResponses from './pages/MyResponses';
import TeacherRegister from './pages/TeacherRegister';
import SchoolRegister from './pages/SchoolRegister';
import TeacherResumes from './pages/TeacherResumes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/teacher" element={<TeacherRegister />} />
            <Route path="/register/school" element={<SchoolRegister />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/profile/teacher" element={<TeacherProfile />} />
            <Route path="/profile/school" element={<SchoolProfile />} />
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
            <Route path="/dashboard/school" element={<SchoolDashboard />} />
            <Route path="/my-responses" element={<MyResponses />} />
            <Route path="/resumes" element={<TeacherResumes />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;