import { Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: <HomeIcon sx={{ color: 'white' }} />, text: t('Главная') },
    { path: '/profile/me', icon: <PersonIcon sx={{ color: 'white' }} />, text: t('Профиль') },
    { path: '/notifications', icon: <NotificationsIcon sx={{ color: 'white' }} />, text: t('Уведомления') },
    { path: '/messages', icon: <MessageIcon sx={{ color: 'white' }} />, text: t('Сообщения') },
    { path: '/study', icon: <SchoolIcon sx={{ color: 'white' }} />, text: t('Учеба') },
    { path: '/conferences', icon: <GroupIcon sx={{ color: 'white' }} />, text: t('Конференции') },
    { path: '/checklist', icon: <AssignmentIcon sx={{ color: 'white' }} />, text: t('Чек-лист') },
  ];

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: '#000000',
        borderRight: 1,
        borderColor: 'divider',
        color: 'white',
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar; 