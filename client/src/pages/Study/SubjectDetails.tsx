import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config';
import PageLayout from '../../components/PageLayout';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import LessonCard from '../../components/LessonCard';
import type { Subject, Lesson, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const SubjectDetails: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createLessonModalOpen, setCreateLessonModalOpen] = useState(false);
  const [editLessonModalOpen, setEditLessonModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [editSubjectModalOpen, setEditSubjectModalOpen] = useState(false);
  const [editedSubject, setEditedSubject] = useState({ name: '', description: '', id: '' });

  const { t } = useTranslation();

  const { data: subject, isLoading } = useQuery({
    queryKey: ['subject', subjectId || ''],
    queryFn: async () => {
      if (!subjectId) return Promise.reject(new Error("Subject ID is not available"));
      const token = localStorage.getItem('token');
      const response = await axios.get<Subject>(`${API_URL}/api/subjects/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!subjectId,
  });

  useEffect(() => {
    if (subject) {
      setEditedSubject({ name: subject.title, description: subject.description, id: subject.id.toString() });
    }
  }, [subject]);

  const createLessonMutation = useMutation<Lesson, Error, { name: string; description: string }>({
    mutationFn: async (lessonData) => {
      const token = localStorage.getItem('token');
      const response = await axios.post<Lesson>(
        `${API_URL}/api/lessons`,
        {
          ...lessonData,
          subjectId: subjectId,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      setCreateLessonModalOpen(false);
      setNewLesson({ name: '', description: '' });
    },
    onError: (error) => {
      setError('Failed to create lesson. Please try again.');
    },
  });

  const updateLessonMutation = useMutation<Lesson, Error, { name: string; description: string }>({
    mutationFn: async (lessonData) => {
      if (!selectedLesson?.id) return Promise.reject(new Error("Lesson ID is not available"));
      const token = localStorage.getItem('token');
      const response = await axios.put<Lesson>(
        `${API_URL}/api/lessons/${selectedLesson.id}`,
        lessonData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      setEditLessonModalOpen(false);
      setSelectedLesson(null);
    },
    onError: (error) => {
      setError('Failed to update lesson. Please try again.');
    },
  });

  const deleteLessonMutation = useMutation<void, Error, number>({
    mutationFn: async (lessonId) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
    },
    onError: (error) => {
      setError('Failed to delete lesson. Please try again.');
    },
  });

  const updateSubjectMutation = useMutation<Subject, Error, { name: string; description: string }>({
    mutationFn: async (subjectData) => {
      if (!subjectId) return Promise.reject(new Error("Subject ID is not available"));
      const token = localStorage.getItem('token');
      const response = await axios.put<Subject>(
        `${API_URL}/api/subjects/${subjectId}`,
        subjectData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject', subjectId] });
      setEditSubjectModalOpen(false);
    },
    onError: (error) => {
      setError('Failed to update subject. Please try again.');
    },
  });

  const deleteSubjectMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!subjectId) return Promise.reject(new Error("Subject ID is not available"));
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/subjects/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      navigate('/study');
    },
    onError: (error) => {
      setError('Failed to delete subject. Please try again.');
    },
  });

  const handleCreateLesson = () => {
    createLessonMutation.mutate(newLesson);
  };

  const handleUpdateLesson = () => {
    if (selectedLesson) {
      updateLessonMutation.mutate(newLesson);
    }
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    if (window.confirm(t('confirm_delete_lesson'))) {
      deleteLessonMutation.mutate(lesson.id);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setNewLesson({ name: lesson.name, description: lesson.description });
    setEditLessonModalOpen(true);
  };

  const handleEditSubjectClick = () => {
    if (subject) {
      setEditedSubject({ name: subject.title, description: subject.description, id: subject.id.toString() });
      setEditSubjectModalOpen(true);
    }
  };

  const handleDeleteSubjectClick = () => {
    if (window.confirm(t('confirm_delete_subject'))) {
      deleteSubjectMutation.mutate();
    }
  };

  const handleUpdateSubject = () => {
    updateSubjectMutation.mutate(editedSubject);
  };

  if (isLoading) {
    return (
      <PageLayout title={t('loading')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!subject) {
    return (
      <PageLayout title={t('subject_not_found')}>
        <Typography align="center" sx={{ mt: 4 }}>
          {t('subject_not_found_or_no_access')}
        </Typography>
      </PageLayout>
    );
  }

  const canEdit = user?.role === 'teacher' || user?.role === 'super-admin';

  const actions = canEdit ? [
    <Button
      key="edit-subject"
      variant="outlined"
      color="warning"
      startIcon={<EditIcon />}
      onClick={handleEditSubjectClick}
      sx={{ ml: 2 }}
    >
      {t('edit_subject')}
    </Button>,
    <Button
      key="delete-subject"
      variant="outlined"
      color="error"
      startIcon={<DeleteIcon />}
      onClick={handleDeleteSubjectClick}
      sx={{ ml: 2 }}
    >
      {t('delete_subject')}
    </Button>
  ] : undefined;

  return (
    <PageLayout title={subject.title} actions={actions}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {subject.description}
        </Typography>
      </Box>

      {canEdit && (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateLessonModalOpen(true)}
          >
            {t('add_lesson')}
          </Button>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {subject.lessons?.map(lesson => (
          <Grid item xs={12} sm={6} md={4} key={lesson.id}>
            <LessonCard
              lesson={lesson}
              onEdit={canEdit ? () => handleEditLesson(lesson) : undefined}
              onDelete={canEdit ? () => handleDeleteLesson(lesson) : undefined}
            />
          </Grid>
        ))}
      </Grid>

      {/* Create Lesson Modal */}
      <Dialog open={createLessonModalOpen} onClose={() => setCreateLessonModalOpen(false)}>
        <DialogTitle>{t('create_lesson')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('lesson_name')}
            fullWidth
            value={newLesson.name}
            onChange={(e) => setNewLesson({ ...newLesson, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label={t('lesson_description')}
            fullWidth
            multiline
            rows={4}
            value={newLesson.description}
            onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateLessonModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleCreateLesson} color="primary">{t('create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lesson Modal */}
      <Dialog open={editLessonModalOpen} onClose={() => setEditLessonModalOpen(false)}>
        <DialogTitle>{t('edit_lesson')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('lesson_name')}
            fullWidth
            value={newLesson.name}
            onChange={(e) => setNewLesson({ ...newLesson, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label={t('lesson_description')}
            fullWidth
            multiline
            rows={4}
            value={newLesson.description}
            onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditLessonModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleUpdateLesson} color="primary">{t('save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={editSubjectModalOpen} onClose={() => setEditSubjectModalOpen(false)}>
        <DialogTitle>{t('edit_subject')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label={t('subject_name')}
            value={editedSubject.name}
            onChange={(e) => setEditedSubject({ ...editedSubject, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label={t('subject_description')}
            fullWidth
            multiline
            rows={4}
            value={editedSubject.description}
            onChange={(e) => setEditedSubject({ ...editedSubject, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSubjectModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleUpdateSubject} color="primary">{t('save')}</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default SubjectDetails; 