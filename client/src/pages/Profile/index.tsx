import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Stack,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Trends from '../../components/Trends'
import styles from '../Home/Home.module.css'
import { useAuth } from '../../contexts/AuthContext'
import CloseIcon from '@mui/icons-material/Close'
import { API_URL } from '../../config'
import Post from '../../components/Post'

interface User {
  id: string
  name: string
  nickname: string
  group: string
  about: string
  avatar: string
  banner: string
  followers: any[]
  following: any[]
}

interface Post {
  id: string
  content: string
  media: string[]
  author: {
    id: string
    name: string
    nickname: string
    avatar: string
  }
  likes: string[]
  likesCount: number
  commentsCount: number
  retweetsCount: number
  createdAt: string
  updatedAt: string
  isLiked: boolean
  isRetweeted: boolean
}

interface ProfileProps {
  isMe?: boolean;
}

// Добавляем перехватчик для автоматической подстановки токена
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const Profile = ({ isMe = false }: ProfileProps) => {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [editBanner, setEditBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Выбор эндпоинта и ключа для useQuery
  const userQueryKey = isMe ? ['user', 'me'] : ['user', id];
  const userQueryFn = async () => {
    if (isMe) {
      const { data } = await axios.get('/api/users/me');
      return data;
    } else {
      const { data } = await axios.get(`/api/users/${id}`);
      return data;
    }
  };

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: userQueryKey,
    queryFn: userQueryFn,
    enabled: isMe ? !!currentUser : !!id,
  });

  // Update edit states when user data is loaded
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditAbout(user.about || '');
      setEditGroup(user.group || '');
    }
  }, [user]);

  const postsQueryKey = isMe ? ['posts', 'user', 'me'] : ['posts', 'user', id];
  const postsQueryFn = async () => {
    if (isMe) {
      const { data } = await axios.get('/api/posts/user/me');
      return data;
    } else {
      const { data } = await axios.get(`/api/posts/user/${id}`);
      return data;
    }
  };

  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: postsQueryKey,
    queryFn: postsQueryFn,
    enabled: isMe ? !!currentUser : !!id,
  });

  // Функция для обновления постов пользователя после действия
  const handlePostActionSuccessForProfile = () => {
    queryClient.invalidateQueries({ queryKey: postsQueryKey });
  };

  const followUser = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const { data } = await axios.post(`/api/users/${id}/follow`)
      return data
    },
    onSuccess: (data) => {
      // Обновляем данные пользователя в кэше с новым статусом подписки
      queryClient.setQueryData(['user', id], (oldUser: User | undefined) => {
        if (!oldUser) return undefined;
        // Используем currentUser?.id вместо data.currentUserId
        const currentUserId = currentUser?.id;
        if (!currentUserId) return oldUser; // Не обновляем, если нет текущего пользователя

        const updatedFollowers = data.isFollowing
          ? [...oldUser.followers, { id: currentUserId }] // Добавляем текущего пользователя в подписчики
          : oldUser.followers.filter(follower => follower.id !== currentUserId); // Удаляем текущего пользователя из подписчиков

        return { ...oldUser, followers: updatedFollowers };
      });
      // Возможно, также потребуется обновить данные текущего пользователя, чтобы отобразить изменения в списке подписок
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  })

  const unfollowUser = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const { data } = await axios.post(`/api/users/${id}/unfollow`)
      return data
    },
    onSuccess: (data) => {
      // Обновляем данные пользователя в кэше после отписки
       queryClient.setQueryData(['user', id], (oldUser: User | undefined) => {
        if (!oldUser) return undefined;
        // Используем currentUser?.id вместо data.currentUserId
        const currentUserId = currentUser?.id;
         if (!currentUserId) return oldUser; // Не обновляем, если нет текущего пользователя

        const updatedFollowers = oldUser.followers.filter(follower => follower.id !== currentUserId); // Удаляем текущего пользователя из подписчиков

        return { ...oldUser, followers: updatedFollowers };
      });
       // Возможно, также потребуется обновить данные текущего пользователя
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  })

  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('about', editAbout);
      formData.append('group', editGroup);
      
      if (editAvatar) {
        formData.append('avatar', editAvatar);
      }
      
      if (editBanner) {
        formData.append('banner', editBanner);
      }

      await axios.put(`${API_URL}/api/users/me`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      queryClient.invalidateQueries({ queryKey: userQueryKey });
      handleEditClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Глобальный фон для светлой темы
  document.body.style.background = '#15202b'

  if (isLoadingUser || isLoadingPosts) {
    return <div style={{ color: '#1da1f2', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>
  }

  if (!user) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Пользователь не найден</div>
  }

  const isFollowing = user.followers.some(
    (follower) => follower.id === currentUser?.id
  )

  return (
    <div className={styles.container}>
      <main className={styles.home} style={{ flex: 1 }}>
        <div
          className={styles.feed}
          style={{
            display: 'block',
            minHeight: '100vh',
            background: '#15202b',
            borderLeft: 'none',
            borderRight: 'none',
            padding: 0,
          }}
        >
          {/* Header */}
          <Box sx={{
            position: 'sticky',
            top: 0,
            bgcolor: '#15202b',
            zIndex: 1100,
            borderBottom: '1px solid #22303c',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: '#fff',
          }}>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1, color: '#fff' }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 20, color: '#fff' }}>{user.name} <CheckCircleIcon sx={{ color: '#1da1f2', fontSize: 18, verticalAlign: 'middle' }} /></Typography>
              <Typography variant="body2" sx={{ color: '#8899a6' }}>
                {posts?.length || 0} постов
              </Typography>
            </Box>
          </Box>

          {/* Banner + Avatar + Button */}
          <Box sx={{ position: 'relative', mb: 0 }}>
            {/* Banner */}
            <Box sx={{
              height: { xs: 120, sm: 220 },
              bgcolor: '#e6ecf0',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: user.banner ? `url(${API_URL}${user.banner})` : 'none',
            }} />
            {/* Аватар */}
            <Avatar
              src={`${API_URL}${user.avatar}`}
              sx={{
                position: 'absolute',
                left: 24,
                bottom: -56,
                width: { xs: 120, sm: 144 },
                height: { xs: 120, sm: 144 },
                border: '4px solid',
                borderColor: '#15202b',
              }}
            />
            {/* Кнопка Follow/Unfollow или Редактировать профиль */}
            <Box sx={{ position: 'absolute', right: 24, bottom: 16 }}>
              {isMe ? (
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    borderRadius: 6,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    bgcolor: '#1da1f2',
                    color: '#fff',
                    '&:hover': { bgcolor: '#1a8cd8' },
                  }}
                  onClick={handleEditOpen}
                >
                  Редактировать профиль
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="medium"
                  sx={{
                    borderRadius: 6,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    bgcolor: '#15202b',
                    borderColor: '#1da1f2',
                    color: '#1da1f2',
                    '&:hover': { bgcolor: '#22303c', borderColor: '#1da1f2' },
                  }}
                  onClick={() =>
                    isFollowing ? unfollowUser.mutate() : followUser.mutate()
                  }
                >
                  {isFollowing ? 'Отписаться' : 'Подписаться'}
                </Button>
              )}
            </Box>
          </Box>

          {/* Блок информации */}
          <Box sx={{ px: 3, pt: 7, pb: 2, color: '#fff' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: 22, color: '#fff' }}>{user.name}</Typography>
            <Typography sx={{ mb: 1, fontSize: 16, color: '#8899a6' }}>@{user.nickname}</Typography>
            {user.about && (
              <Typography sx={{ mb: 1, fontSize: 16, color: '#fff' }}>{user.about}</Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#8899a6', fontSize: 15, mb: 1 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#8899a6' }}>
                <span style={{ fontSize: 18, verticalAlign: 'middle' }}>🎓</span> {user.group}
              </Typography>
            </Box>
            {/* Статистика */}
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', fontSize: 15, mb: 1 }}>
              <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, color: '#fff' }}>
                <Typography component="span" fontWeight="bold" sx={{ color: '#fff' }}>{user.following.length}</Typography>
                <Typography component="span" sx={{ ml: 0.5, color: '#8899a6' }}>Подписок</Typography>
              </Box>
              <Box component="span" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, color: '#fff' }}>
                <Typography component="span" fontWeight="bold" sx={{ color: '#fff' }}>{user.followers.length}</Typography>
                <Typography component="span" sx={{ ml: 0.5, color: '#8899a6' }}>Подписчиков</Typography>
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{
              borderBottom: '1px solid #22303c',
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 'auto',
                px: 4,
                py: 2,
                fontWeight: 600,
                fontSize: 17,
                color: '#8899a6',
              },
              '& .Mui-selected': {
                fontWeight: 'bold',
                color: '#1da1f2',
              },
            }}
          >
            <Tab label="Посты" />
            <Tab label="Медиа" />
          </Tabs>

          {/* Content */}
          <Box>
            {activeTab === 0 ? (
              <Stack divider={<Divider sx={{ borderColor: '#22303c' }} />}>
                {posts?.length === 0 && (
                  <Typography sx={{ color: '#8899a6', textAlign: 'center', mt: 4 }}>Постов пока нет</Typography>
                )}
                {posts?.map((post) => (
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
                    onLike={handlePostActionSuccessForProfile}
                    onRetweet={handlePostActionSuccessForProfile}
                    onComment={handlePostActionSuccessForProfile}
                  />
                ))}
              </Stack>
            ) : (
              <Box sx={{ p: 2, display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {posts
                  ?.filter((post) => post.media && post.media.length > 0)
                  .map((post) => (
                    <Box
                      key={post.id}
                      component="img"
                      src={post.media[0]}
                      sx={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 12,
                        objectFit: 'cover',
                      }}
                    />
                  ))}
              </Box>
            )}
          </Box>
        </div>
        <div className={styles.widgets}>
          <Trends />
        </div>
      </main>
      {/* Модальное окно редактирования профиля */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Редактировать профиль
          <IconButton onClick={handleEditClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Имя" value={editName} onChange={e => setEditName(e.target.value)} fullWidth />
            <TextField label="О себе" value={editAbout} onChange={e => setEditAbout(e.target.value)} fullWidth multiline rows={3} />
            <TextField label="Группа" value={editGroup} onChange={e => setEditGroup(e.target.value)} fullWidth />
            <Box>
              <Typography variant="subtitle2">Аватар</Typography>
              <input type="file" accept="image/*" onChange={e => setEditAvatar(e.target.files?.[0] || null)} />
            </Box>
            <Box>
              <Typography variant="subtitle2">Баннер</Typography>
              <input type="file" accept="image/*" onChange={e => setEditBanner(e.target.files?.[0] || null)} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={loading}>Отмена</Button>
          <Button onClick={handleProfileSave} variant="contained" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Profile 