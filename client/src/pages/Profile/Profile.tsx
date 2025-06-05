import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, getUserPosts } from '../../services/api';
import { Box, Typography, CircularProgress } from '@mui/material';
import PostList from '../../components/PostList';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserProfile(id),
    enabled: !!id
  });
  
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', id],
    queryFn: () => getUserPosts(id),
    enabled: !!id
  });

  if (userLoading || postsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5">User not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box p={3}>
        <Typography variant="h4">{user.nickname}</Typography>
        {user.bio && <Typography variant="body1">{user.bio}</Typography>}
      </Box>
      <PostList posts={posts || []} />
    </Box>
  );
};

export default Profile; 