import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Home as HomeIcon,
  Tag as TagIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Bookmark as BookmarkIcon,
  ListAlt as ListAltIcon,
  Person as PersonIcon,
  MoreHoriz as MoreHorizIcon,
  Logout as LogoutIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import styles from './Sidebar.module.css'
import { useTranslation } from 'react-i18next'

const menuItems = [
  { text: 'home', icon: <HomeIcon />, path: '/' },
  { text: 'conferences', icon: <VideoCallIcon />, path: '/conferences' },
  { text: 'notifications', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'messages', icon: <MailIcon />, path: '/messages' },
  { text: 'study', icon: <BookmarkIcon />, path: '/study' },
  { text: 'checklist', icon: <ListAltIcon />, path: '/lists' },
  { text: 'settings', icon: <MoreHorizIcon />, path: '/settings' },
  { text: 'profile', icon: <PersonIcon />, path: '/profile/me' },
]

const Sidebar = () => {
  const location = useLocation()
  const { logout, user } = useAuth()
  const { mode } = useTheme()
  const { t } = useTranslation()

  const isActive = (path: string) => {
    if (path === '/profile/me') {
      return location.pathname.startsWith('/profile')
    }
    return location.pathname === path
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
          <span style={{ color: '#ffffff', fontSize: 40, fontWeight: 'bold', fontFamily: 'monospace' }}>&lt;SL&gt;</span>
        </div>
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <RouterLink
                key={item.text}
                to={item.path}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 22, 
                  padding: '12px 24px', 
                  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)', 
                  textDecoration: 'none', 
                  fontWeight: active ? 700 : 500, 
                  background: active ? 'rgba(255, 255, 255, 0.1)' : 'none', 
                  borderRadius: 32, 
                  margin: '4px 0', 
                  fontSize: 22, 
                  transition: 'background 0.2s',
                }}
              >
                {item.icon}
                <span>{t(item.text)}</span>
              </RouterLink>
            )
          })}
          <button
            onClick={logout}
            className={styles.logoutButton}
          >
            <LogoutIcon />
            <span>{t('logout')}</span>
          </button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <img
            src={user?.avatar || '/unknown-user.svg'}
            alt="Профиль"
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#ffffff' }}>{user?.nickname}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>@{user?.nickname}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 