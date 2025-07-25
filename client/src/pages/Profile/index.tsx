import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
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
import styles from '../Home/Home.module.css'
import { useAuth } from '../../contexts/AuthContext'
import CloseIcon from '@mui/icons-material/Close'
import { API_URL } from '../../config'
import Post from '../../components/Post'
import RecentPostsSidebar from '../../components/RecentPostsSidebar'

interface User {
  id: string
  name: string
  nickname: string
  user_group: string
  about: string
  avatar: string
  banner: string
  followers: any[]
  following: any[]
}

interface Post {
  id: string
  content: string
  media: {
    id: string;
    type: string;
    path: string;
    createdAt: string;
  }[];
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
  poll?: {
    question: string;
    options: {
      text: string;
      votes: number;
      voterIds?: string[];
    }[];
    votes?: string[];
  } | null
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
  const [editUserGroup, setEditUserGroup] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [editBanner, setEditBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Выбор эндпоинта и ключа для useQuery
  const userQueryKey = isMe ? ['user', 'me'] : ['user', id];
  const userQueryFn = async () => {
    try {
      if (isMe) {
        const { data } = await axios.get(`${API_URL}/api/users/me`);
        setUser(data);
        return data;
      } else {
        const { data } = await axios.get(`${API_URL}/api/users/${id}`);
        return data;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: userQueryKey,
    queryFn: userQueryFn,
    enabled: isMe ? !!currentUser : !!id,
  });

  // Update edit states when user data is loaded
  useEffect(() => {
    if (userData) {
      setEditName(userData.name || '');
      setEditAbout(userData.about || '');
      setEditUserGroup(userData.user_group || '');
    }
  }, [userData]);

  const postsQueryKey = isMe ? ['posts', 'user', 'me'] : ['posts', 'user', id];
  const postsQueryFn = async () => {
    try {
      const token = localStorage.getItem('token');
      let data;
      if (isMe) {
        const response = await axios.get(`${API_URL}/api/posts/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        data = response.data;
      } else {
        const response = await axios.get(`${API_URL}/api/posts/user/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        data = response.data;
      }

      function toCamelCase(obj: any): any {
        if (Array.isArray(obj)) {
          return obj.map(v => toCamelCase(v));
        } else if (obj !== null && typeof obj === 'object') {
          const newObj = Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [
              k.replace(/_([a-z])/g, g => g[1].toUpperCase()),
              toCamelCase(v)
            ])
          );
          if (newObj.id && newObj.likes && Array.isArray(newObj.likes) && currentUser?.id) {
            newObj.isLiked = newObj.likes.includes(currentUser.id);
          }
          // Ensure likesCount, updatedAt, isRetweeted are present even if not explicitly from server
          newObj.likesCount = newObj.likesCount !== undefined ? newObj.likesCount : (newObj.likes ? newObj.likes.length : 0);
          newObj.updatedAt = newObj.updatedAt !== undefined ? newObj.updatedAt : new Date().toISOString(); // Placeholder if missing
          newObj.isRetweeted = newObj.isRetweeted !== undefined ? newObj.isRetweeted : false;
          return newObj;
        }
        return obj;
      }

      return toCamelCase(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: postsQueryKey,
    queryFn: postsQueryFn,
    enabled: isMe ? !!currentUser : !!id,
  });

  const followUser = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await axios.post(`/api/users/${id}/follow`)
    },
    onSuccess: () => {
      queryClient.setQueryData(['user', id], (oldUser: User | undefined) => {
        if (!oldUser) return undefined;
        const currentUserId = currentUser?.id;
        if (!currentUserId) return oldUser;

        const updatedFollowers = [...oldUser.followers, { id: currentUserId }];
        return { ...oldUser, followers: updatedFollowers };
      });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  })

  const unfollowUser = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await axios.post(`/api/users/${id}/unfollow`)
    },
    onSuccess: () => {
      queryClient.setQueryData(['user', id], (oldUser: User | undefined) => {
        if (!oldUser) return undefined;
        const currentUserId = currentUser?.id;
        if (!currentUserId) return oldUser;

        const updatedFollowers = oldUser.followers.filter(follower => follower.id !== currentUserId);
        return { ...oldUser, followers: updatedFollowers };
      });
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
      formData.append('user_group', editUserGroup);
      
      if (editAvatar) {
        formData.append('avatar', editAvatar);
      }
      
      if (editBanner) {
        formData.append('banner', editBanner);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: userQueryKey });
        handleEditClose();
      } else {
        console.error('Error updating profile:', data.message);
      }
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

  const isFollowing = user.followers && user.followers.some(
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
                <span style={{ fontSize: 18, verticalAlign: 'middle' }}>🎓</span> {user.user_group}
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
                    author={post.author}
                    createdAt={post.createdAt}
                    likes={post.likes}
                    commentsCount={post.commentsCount}
                    retweetsCount={post.retweetsCount}
                    media={post.media}
                    poll={post.poll}
                    likesCount={post.likesCount}
                    updatedAt={post.updatedAt}
                    isLiked={post.isLiked}
                    isRetweeted={post.isRetweeted}
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
                      src={post.media[0].path}
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
      </main>
      <div className={styles.widgets}>
        <RecentPostsSidebar />
      </div>
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
            <TextField label="Группа" value={editUserGroup} onChange={e => setEditUserGroup(e.target.value)} fullWidth />
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