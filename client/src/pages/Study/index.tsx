import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  teachers: { // Предполагаем, что бэкенд возвращает учителей в таком формате
    id: string;
    nickname: string;
    name: string;
    avatar?: string;
  }[];
}

const Study = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const navigate = useNavigate();

  // Fetch courses
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/api/courses`);
      return data;
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation<Course, Error, { title: string; description?: string }>({
    mutationFn: async (newCourseData) => {
      const { data } = await axios.post(`${API_URL}/api/courses`, newCourseData);
      return data;
    },
    onSuccess: () => {
      // Invalidate the courses query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      // Close modal and clear form
      setCreateModalOpen(false);
      setNewCourseTitle('');
      setNewCourseDescription('');
    },
    onError: (error) => {
      console.error('Error creating course:', error);
      // Optionally show an error message to the user
    },
  });

  const handleCreateSubmit = () => {
    createCourseMutation.mutate({ title: newCourseTitle, description: newCourseDescription });
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/study/${courseId}`);
  };

  const isCreatingCourse = createCourseMutation.status === 'pending';

  if (isLoading) {
    return (
      <PageLayout title="Учёба">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Учёба">
        <Box p={2}>
          <Alert severity="error">Ошибка загрузки курсов: {error.message}</Alert>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Учёба">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Курсы</Typography>
        
        {/* Button to open create course modal */}
        <Button variant="contained" onClick={() => setCreateModalOpen(true)} sx={{ mb: 2 }}>
          Создать новый курс
        </Button>

        {/* List of courses */}
        {courses && courses.length > 0 ? (
          <List>
            {courses.map((course) => (
              <ListItem key={course.id} divider button onClick={() => handleCourseClick(course.id)}>
                <ListItemText 
                  primary={course.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Преподаватели: {course.teachers.map(t => t.name).join(', ') || 'Нет данных'}
                      </Typography>
                      {course.description && 
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                          {course.description}
                        </Typography>
                      }
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Курсов пока нет.</Typography>
        )}

        {/* Create course modal */}
        <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Создать новый курс</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название курса"
              type="text"
              fullWidth
              variant="outlined"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Описание курса (необязательно)"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateModalOpen(false)}>Отмена</Button>
            <Button onClick={handleCreateSubmit} disabled={isCreatingCourse}>
              {isCreatingCourse ? 'Создание...' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  );
};

export default Study; 