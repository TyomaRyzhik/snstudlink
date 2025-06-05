import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showNotification } from '../../utils/notification';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showNotification(t(isLogin ? 'login_success' : 'register_success'), 'success');
      navigate('/');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : t('auth_error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t(isLogin ? 'login' : 'register')}
        </Typography>

        <TextField
          fullWidth
          label={t('email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label={t('password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{ mt: 3 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t(isLogin ? 'login' : 'register')
          )}
        </Button>

        <Button
          fullWidth
          onClick={() => setIsLogin(!isLogin)}
          sx={{ mt: 2 }}
        >
          {t(isLogin ? 'need_account' : 'have_account')}
        </Button>
      </Box>
    </Box>
  );
};

export default Auth; 