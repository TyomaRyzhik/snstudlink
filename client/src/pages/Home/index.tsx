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

interface Post {
  id: string
  content: string
  media: string[]
  author: {
    id: string
    nickname: string
    avatar?: string
  }
  likes: string[]
  likesCount: number
  commentsCount: number
  retweetsCount: number
  createdAt: string
  updatedAt: string
  isLiked: boolean
  isRetweeted: boolean
  poll?: { question: string; options: { text: string; votes: number }[] } | null
}

const Home = () => {
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const backendApiUrl = API_URL

  const { data: posts, isLoading, error } = useQuery<PostType[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/posts/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      return response.json()
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
      showNotification('Ошибка при лайке публикации', 'error')
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
      showNotification('Публикация успешно репостнута', 'success')
    } catch (error) {
      showNotification('Ошибка при репосте публикации', 'error')
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
      showNotification('Публикация успешно удалена', 'success')
    } catch (error) {
      showNotification('Ошибка при удалении публикации', 'error')
    }
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading posts</Typography>
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
      <PageLayout title="Главная">
        <CreatePost />
        <div className={styles.noPosts}>
          Пока нет публикаций. Будьте первым, кто поделится чем-то интересным!
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Главная">
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