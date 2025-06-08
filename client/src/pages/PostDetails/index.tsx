import { Box, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import Post from '../../components/Post';
import { API_URL } from '../../config';
import { useQuery } from '@tanstack/react-query';

const PostDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <PageLayout title="Публикация">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Публикация">
        <Typography color="error" align="center">
          Ошибка загрузки публикации
        </Typography>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout title="Публикация">
        <Typography align="center">
          Публикация не найдена
        </Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Публикация">
      <Post {...post} />
    </PageLayout>
  );
};

export default PostDetails; 