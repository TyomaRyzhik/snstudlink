import React from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../config';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  createdAt: string;
}

const RecentPostsSidebar = () => {
  const { t } = useTranslation();
  
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['recentPosts'],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/posts/feed`);
        // Возвращаем только последние 3 поста
        return data.slice(0, 3);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        throw new Error('Failed to fetch recent posts');
      }
    },
  });

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        ml: 4,
        py: 2,
        px: 2,
        bgcolor: '#192734',
        borderRadius: 1,
        color: 'white',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
        {t('recent_publications')}
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body2" align="center" sx={{ color: 'red' }}>
          {t('failed_to_load_recent_posts')}
        </Typography>
      )}

      {!isLoading && !error && (!posts || posts.length === 0) && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ color: '#8899a6' }}>
          {t('no_recent_posts')}
        </Typography>
      )}

      {!isLoading && !error && posts && posts.length > 0 && (
        <Box>
          {posts.map((post, index) => {
            const createdAtDate = new Date(post.createdAt);
            const isValidDate = !isNaN(createdAtDate.getTime());
            const formattedDate = isValidDate
              ? formatDistanceToNowStrict(createdAtDate, { addSuffix: true, locale: ru })
              : '';

            return (
              <React.Fragment key={post.id}>
                <Link
                  to={`/post/${post.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Box
                    sx={{
                      mb: index === posts.length - 1 ? 0 : 2,
                      pt: index === 0 ? 0 : 1,
                      pb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#8899a6', display: 'flex', alignItems: 'center', fontWeight: 'normal', mb: 0.5 }}>
                      {post.author.nickname}
                      {formattedDate && (
                        <>
                          <Box component="span" sx={{ mx: 0.5 }}>&middot;</Box>
                          {formattedDate}
                        </>
                      )}
                    </Typography>
                    <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: 'white' }}>
                      {post.content}
                    </Typography>
                  </Box>
                </Link>
                {index < posts.length - 1 && <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />}
              </React.Fragment>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default RecentPostsSidebar; 