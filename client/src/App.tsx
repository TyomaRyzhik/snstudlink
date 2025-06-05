import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import CourseDetails from './pages/Study/CourseDetails';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Lists from './pages/Lists';
import Profile from './pages/Profile';
import More from './pages/More';
import { ConferencesPage } from './pages/ConferencesPage';
import StudyPage from './pages/Study';
import SubjectDetails from './pages/Study/SubjectDetails';
import CreateSubjectPage from './pages/Study/CreateSubjectPage';
import LessonDetails from './pages/Study/LessonDetails';
import CreateCoursePage from './pages/Study/CreateCoursePage';
import RoleBasedRoute from './components/RoleBasedRoute';
import ChecklistPage from './pages/ChecklistPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading indicator
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return null; // Or a top-level loading indicator for the whole app
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* Protected routes using Layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/profile/:id" element={<Profile />} /> {/* Use Profile component for dynamic profile route */}
        <Route path="/profile/me" element={<Profile isMe={true} />} /> {/* Use Profile component for current user's profile */}
        <Route path="/study" element={<StudyPage />} />
        <Route path="/study/course/:courseId" element={<CourseDetails />} />
        <Route path="/study/subject/:subjectId" element={<SubjectDetails />} />
        <Route path="/study/lesson/:lessonId" element={<LessonDetails />} />
        <Route path="/conferences" element={<ConferencesPage />} />
        <Route path="/checklist" element={<ChecklistPage />} /> {/* Route for the Checklist page */}

        {/* Role-based protected routes */}
        <Route element={<RoleBasedRoute allowedRoles={['teacher', 'super-admin']} />}>
          <Route path="/study/subject/create" element={<CreateSubjectPage />} />
          <Route path="/study/course/create" element={<CreateCoursePage />} />
        </Route>

        <Route path="/settings" element={<More />} /> {/* Use More component for Settings */}
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/unauthorized" element={<Typography variant="h4" align="center" sx={{ mt: 4 }}>Unauthorized Access</Typography>} />
    </Routes>
  );
};

export default App; 