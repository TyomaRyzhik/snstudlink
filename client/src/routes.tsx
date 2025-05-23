import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Bookmarks from './pages/Bookmarks';
import Lists from './pages/Lists';
import More from './pages/More';
import Study from './pages/Study';
import CourseDetails from './pages/Study/CourseDetails';

const AppRoutes = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
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
        </Route>
      </Routes>
    </Box>
  );
};

export default AppRoutes; 