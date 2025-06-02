import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotification } from '../../contexts/NotificationContext'
import styles from './Home.module.css'
import PageLayout from '../../components/PageLayout'
import CreatePost from '../../components/CreatePost'
import Post from '../../components/Post'
import { API_URL } from '../../config'
import { Box, Typography, CircularProgress } from '@mui/material'
import { Post as PostType } from '../../types'
import { useTranslation } from 'react-i18next'

interface Post {
  id: string
  content: string
  media?: Array<{
    id: string;
    type: string;
    path: string;
    createdAt: string;
  }>;
  author: {
    id: string
    nickname: string
    avatar?: string
  }
  likes?: string[];
  likesCount?: number
  commentsCount?: number
  retweetsCount?: number
  createdAt: string
  updatedAt?: string
  isLiked?: boolean
  isRetweeted?: boolean
  poll?: { question: string; options: { text: string; votes: number }[] } | null
}

const Home = () => {
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const backendApiUrl = API_URL
  const { t } = useTranslation()

  const { data: posts, isLoading, error } = useQuery<PostType[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      console.log('Token from localStorage:', token ? 'exists' : 'missing')
      const response = await fetch(`${API_URL}/api/posts/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      console.log('Response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Error response:', errorData)
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json();
      // Преобразуем все поля в camelCase
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
      return toCamelCase(data);
    },
  })

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to like post')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    } catch (error) {
      showNotification(t('error_liking_post'), 'error')
    }
  }

  const handleCommentPost = async (postId: string) => {
    // Открытие модального окна для комментариев происходит в компоненте Post
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  const handleRetweetPost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/retweet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to retweet post')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      showNotification(t('post_retweeted_successfully'), 'success')
    } catch (error) {
      showNotification(t('error_retweeting_post'), 'error')
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to delete post')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      showNotification(t('post_deleted_successfully'), 'success')
    } catch (error) {
      showNotification(t('error_deleting_post'), 'error')
    }
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{t('error_loading_posts')}</Typography>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  console.log('Posts before rendering:', posts)

  if (!posts || posts.length === 0) {
    return (
      <PageLayout title={t('home')}>
        <CreatePost />
        <div className={styles.noPosts}>
          {t('no_posts_yet')}
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('home')}>
      <CreatePost onPostCreated={() => queryClient.invalidateQueries({ queryKey: ['posts'] })} />
      {posts?.map((post) => {
        console.log('Processing post:', JSON.stringify(post, null, 2))
        if (!post.author || typeof post.author !== 'object') {
          console.log('Post skipped: invalid author object')
          return null
        }
        if (!post.author.id) {
          console.log('Post skipped: missing author id')
          return null
        }
        if (!post.author.nickname) {
          console.log('Post skipped: missing author nickname')
          return null
        }
        return (
          <Post
            key={post.id}
            id={post.id}
            content={post.content}
            author={{
              id: post.author.id,
              nickname: post.author.nickname,
              avatar: post.author.avatar,
            }}
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
            likes={post.likes}
            commentsCount={post.commentsCount}
            retweetsCount={post.retweetsCount}
            isLiked={post.isLiked}
            isRetweeted={post.isRetweeted}
            media={post.media}
            onLike={() => handleLikePost(post.id)}
            onRetweet={() => handleRetweetPost(post.id)}
            onComment={() => handleCommentPost(post.id)}
            onDelete={() => handleDeletePost(post.id)}
            poll={post.poll}
          />
        )
      })}
    </PageLayout>
  )
}

export default Home