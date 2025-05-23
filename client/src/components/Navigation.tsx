import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const menuItems = [
    { text: 'Главная', icon: <HomeIcon />, path: '/' },
    { text: 'Учёба', icon: <SchoolIcon />, path: '/study' },
    { text: 'Профиль', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  if (loading) {
    return null;
  }

  const hideNavigation = location.pathname === '/auth' || location.pathname === '/register';

  if (hideNavigation && !user) {
    return null;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StudLink
          </Typography>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          ) : (
            <Button color="inherit" onClick={() => navigate('/auth')}>
              Войти
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        >
          {user && (
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          )}
          <Divider />
          {user && (
            <List>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Выйти" />
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation; 