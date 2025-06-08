import React, { useState } from 'react';
import { Box, Typography, List, ListItem, Avatar, Divider, Tabs, Tab, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../config';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PageLayout from '../../components/PageLayout';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  type: 'mention' | 'like' | 'comment' | 'follow';
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  post?: {
    id: string;
    content: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

const Notifications = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <FavoriteIcon color="error" />;
      case 'comment':
        return <CommentIcon color="info" />;
      case 'follow':
        return <PersonAddIcon color="success" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return t('liked_your_post');
      case 'comment':
        return t('commented_on_your_post');
      case 'follow':
        return t('followed_you');
      default:
        return '';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark notification as read
      await fetch(`${API_URL}/api/notifications/${notification.id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Navigate to the appropriate page
      if (notification.post) {
        navigate(`/post/${notification.post.id}`);
      } else if (notification.actor) {
        navigate(`/profile/${notification.actor.nickname}`);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const filteredNotifications = notifications?.filter((notification) => {
    if (activeTab === 0) return true; // All tab
    if (activeTab === 1) return notification.type === 'mention';
    if (activeTab === 2) return notification.type === 'like';
    return true;
  }) ?? [];

  if (isLoading) {
    return (
      <PageLayout title={t('notifications')}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={t('notifications')}>
        <Box sx={{ p: 2 }}>
          <Typography color="error" align="center">
            {t('error_loading_notifications')}
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('notifications')}>
      <Box>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="notification tabs" centered sx={{ width: '100%' }}>
          <Tab label={t('all')} sx={{ flexGrow: 1 }} />
          <Tab label={t('mentions')} sx={{ flexGrow: 1 }} />
          <Tab label={t('likes')} sx={{ flexGrow: 1 }} />
        </Tabs>
        <List>
          {filteredNotifications.map((notification, index) => (
            <Box key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', p: 2 }}>
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Avatar
                    src={notification.actor.avatar ? `${API_URL}${notification.actor.avatar}` : undefined}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" component="span">
                      <strong>{notification.actor.nickname}</strong> {getNotificationText(notification)}
                    </Typography>
                    {(notification.post || notification.comment) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mt: 0.5
                        }}
                      >
                        {notification.comment?.content || notification.post?.content}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
              {index < filteredNotifications.length - 1 && <Divider component="li" />}
            </Box>
          ))}
          {filteredNotifications.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              {t('no_notifications_yet')}
            </Typography>
          )}
        </List>
      </Box>
    </PageLayout>
  );
};

export default Notifications; 