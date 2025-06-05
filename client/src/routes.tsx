import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Study from './pages/Study';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Lists from './pages/Lists';
import More from './pages/More';
import CourseDetails from './pages/Study/CourseDetails';

const AppRoutes = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/study" element={<Study />} />
          <Route path="/study/:courseId" element={<CourseDetails />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/profile/me" element={<Profile isMe={true} />} />
          <Route path="/more" element={<More />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default AppRoutes; 