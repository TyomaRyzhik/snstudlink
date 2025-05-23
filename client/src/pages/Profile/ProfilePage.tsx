import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Alert,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import PageLayout from '../../components/PageLayout';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        nickname: user.nickname || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        nickname: formData.nickname,
      });
      setSuccess('Профиль успешно обновлен');
    } catch (err) {
      setError('Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess('Пароль успешно обновлен');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError('Ошибка при обновлении пароля');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageLayout title="Профиль">
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{ width: 100, height: 100, mr: 3 }}
                src={user.avatar}
                alt={user.name}
              />
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  @{user.nickname}
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
                <Box component="form" onSubmit={handleProfileUpdate} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Имя"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="nickname"
                    label="Никнейм"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    disabled={loading}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Изменение пароля
                </Typography>
                <Box component="form" onSubmit={handlePasswordUpdate} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="currentPassword"
                    label="Текущий пароль"
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="newPassword"
                    label="Новый пароль"
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Подтвердите новый пароль"
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    disabled={loading}
                  >
                    {loading ? 'Сохранение...' : 'Изменить пароль'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default ProfilePage; 