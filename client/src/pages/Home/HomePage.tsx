import React from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';

const HomePage: React.FC = () => {
  return (
    <PageLayout title="Главная">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Добро пожаловать в StudLink!
            </Typography>
            <Typography variant="body1" paragraph>
              StudLink - это платформа для онлайн-обучения, которая помогает студентам и преподавателям
              эффективно взаимодействовать в процессе обучения.
            </Typography>
          </Paper>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Учёба
                </Typography>
                <Typography variant="body2">
                  Доступ к курсам, лекциям и учебным материалам. Отслеживайте свой прогресс и выполняйте задания.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Созвоны
                </Typography>
                <Typography variant="body2">
                  Участвуйте в онлайн-встречах с преподавателями и другими студентами. Обсуждайте темы курсов и задавайте вопросы.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Профиль
                </Typography>
                <Typography variant="body2">
                  Управляйте своим профилем, настройками и предпочтениями. Отслеживайте свой прогресс в обучении.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default HomePage; 