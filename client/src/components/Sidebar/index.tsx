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
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Sidebar.module.css'

const menuItems = [
  { text: 'Главная', icon: <HomeIcon />, path: '/' },
  { text: 'Конференции', icon: <TagIcon />, path: '/explore' },
  { text: 'Уведомления', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'Сообщения', icon: <MailIcon />, path: '/messages' },
  { text: 'Учёба', icon: <BookmarkIcon />, path: '/study' },
  { text: 'Чек-лист', icon: <ListAltIcon />, path: '/lists' },
  { text: 'Настройки', icon: <MoreHorizIcon />, path: '/settings' },
  { text: 'Профиль', icon: <PersonIcon />, path: '/profile/me' },
]

const Sidebar = () => {
  const location = useLocation()
  const { logout, user } = useAuth()

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
          <span style={{ color: '#1da1f2', fontSize: 40, fontWeight: 'bold', fontFamily: 'monospace' }}>&lt;SL&gt;</span>
        </div>
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <RouterLink
                key={item.text}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 22, padding: '12px 24px', color: isActive ? '#1da1f2' : '#d9d9d9', textDecoration: 'none', fontWeight: isActive ? 700 : 500, background: isActive ? 'rgba(29,161,242,0.1)' : 'none', borderRadius: 32, margin: '4px 0', fontSize: 22, transition: 'background 0.2s',
                }}
              >
                {item.icon}
                <span>{item.text}</span>
              </RouterLink>
            )
          })}
          <button
            onClick={logout}
            className={styles.logoutButton}
          >
            <LogoutIcon />
            <span>Выйти</span>
          </button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <img
            src={user?.avatar || '/unknown-user.svg'}
            alt="Профиль"
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#fff' }}>{user?.nickname}</div>
            <div style={{ color: '#8899a6' }}>@{user?.nickname}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 