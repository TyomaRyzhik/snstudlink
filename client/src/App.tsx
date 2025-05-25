import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import Navigation from './components/Navigation'; // Navigation is now handled within Layout
// import HomePage from './pages/Home/HomePage'; // Remove HomePage import
// import ProfilePage from './pages/Profile/ProfilePage'; // Remove ProfilePage import
import StudyPage from './pages/Study/StudyPage';
import CourseDetails from './pages/Study/CourseDetails';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import Home from './pages/Home';
// Import components for other sections (assuming they exist and are default exports from index.tsx)
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Lists from './pages/Lists';
import Profile from './pages/Profile'; // Import Profile component
import More from './pages/More'; // Import the More component for Settings
import { ConferencesPage } from './pages/ConferencesPage';
// Assuming ProfilePage handles both /profile and /profile/me, or create a specific one if needed
// import MorePage from './pages/More/MorePage'; // Uncomment if a MorePage component exists

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
        <Route path="/settings" element={<More />} /> {/* Use More component for Settings */}
        <Route path="/conferences" element={<ConferencesPage />} />
        {/* <Route path="/more" element={<MorePage />} /> */}
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App; 