import React from 'react';
import styles from './RecentPostsSidebar.module.css';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../config';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Post as PostType } from '../../types';
import Post from '../Post'; // Reuse the Post component for rendering
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, g => g[1].toUpperCase()),
        toCamelCase(v)
      ])
    );
  }
  return obj;
}

const RecentPostsSidebar = () => {
  const { data: posts, isLoading, error } = useQuery<PostType[]>({
    queryKey: ['recentPosts'], // Use a different query key
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/posts/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recent posts');
      }
      const data = await response.json();
      console.log('Raw data from /api/posts/feed:', data);
      // Optionally, limit the number of posts here or in the backend
      const camelCaseData = toCamelCase(data);
      console.log('Data after toCamelCase:', camelCaseData);
      return camelCaseData.slice(0, 5); // Limit to 5 recent posts
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={1}>
        <Typography color="error" variant="body2">Ошибка загрузки постов</Typography>
      </Box>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Box p={1}>
        <Typography variant="body2" sx={{ color: '#71767b' }}>Нет недавних публикаций</Typography>
      </Box>
    );
  }

  return (
    <div className={styles.container}>
      <h3>Недавние публикации</h3>
      <div className={styles.postsList}>
        {posts.map((post) => (
          // We can reuse the existing Post component, but might need a lighter version
          // For simplicity now, let's use a basic list item
          <Link to={`/post/${post.id}`} key={post.id} className={styles.postItemLink}>
            <div className={styles.postItem}>
              <div className={styles.postItemHeader}>
                <Typography variant="body2" className={styles.postAuthorName}>{post.author?.nickname || 'Unknown'}</Typography>
                <Typography variant="caption" className={styles.postTime}>
                  {(() => {
                    try {
                      const date = new Date(post.createdAt);
                      if (!post.createdAt || isNaN(date.getTime())) {
                        return 'Нет даты';
                      }
                      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
                    } catch (error) {
                      console.error('Error formatting date:', error);
                      return 'Нет даты';
                    }
                  })()}
                </Typography>
              </div>
              <Typography variant="body2" className={styles.postContentSnippet}>
                {post.content ? `${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}` : ''}
              </Typography>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentPostsSidebar; 