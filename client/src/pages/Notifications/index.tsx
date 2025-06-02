import { useState, useEffect } from 'react'
import { Box, Typography, List, ListItem, Avatar, Button, IconButton, Divider, Tabs, Tab } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { API_URL } from '../../config'
import { useNavigate } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'
import RepeatIcon from '@mui/icons-material/Repeat'
import CommentIcon from '@mui/icons-material/Comment'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import PageLayout from '../../components/PageLayout'
import { useTranslation } from 'react-i18next'

interface Notification {
  id: number
  type: 'LIKE' | 'RETWEET' | 'COMMENT' | 'FOLLOW'
  isRead: boolean
  createdAt: string
  actor: {
    id: number
    nickname: string
    avatar: string
  }
  post?: {
    id: number
    content: string
  }
  comment?: {
    id: number
    content: string
  }
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentTab, setCurrentTab] = useState(0)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        setNotifications(notifications.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        setNotifications(notifications.map(notification => ({ ...notification, isRead: true })))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
    // TODO: Implement filtering based on tab (e.g., Mentions)
    // For now, both tabs show all notifications
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'LIKE':
        return <FavoriteIcon color="error" />
      case 'RETWEET':
        return <RepeatIcon color="primary" />
      case 'COMMENT':
        return <CommentIcon color="info" />
      case 'FOLLOW':
        return <PersonAddIcon color="success" />
      default:
        return null
    }
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'LIKE':
        return t('liked_your_post')
      case 'RETWEET':
        return t('retweeted_your_post')
      case 'COMMENT':
        return t('commented_on_your_post')
      case 'FOLLOW':
        return t('followed_you')
      default:
        return ''
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    if (notification.post) {
      navigate(`/post/${notification.post.id}`)
    } else if (notification.actor) {
      navigate(`/profile/${notification.actor.nickname}`)
    }
  }

  // Filter notifications based on the current tab (basic implementation)
  const filteredNotifications = notifications.filter(notification => {
    if (currentTab === 0) return true; // All tab
    if (currentTab === 1) {
      // Mentions tab: Assuming a mention implies a comment or a post reply where user is tagged
      // This requires server-side support for mentions or more complex client-side logic
      // For this basic implementation, we'll show comments as potential mentions.
      return notification.type === 'COMMENT';
    }
    return true;
  })

  return (
    <PageLayout title={t('notifications')}>
      <Box>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="notification tabs" centered sx={{ width: '100%' }}>
          <Tab label={t('all')} sx={{ flexGrow: 1 }} />
          <Tab label={t('mentions')} sx={{ flexGrow: 1 }} />
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
                        locale: ru
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
  )
}

export default Notifications 