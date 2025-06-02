import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { API_URL } from '../../config';
import PageLayout from '../../components/PageLayout';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const CreateSubjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createSubjectMutation = useMutation({
    mutationFn: async (subjectData: { title: string }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/subjects`,
        subjectData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/study/subject/${data.id}`);
    },
    onError: (error: any) => {
      console.error('Error creating subject:', error);
      setError(error.response?.data?.message || 'Failed to create subject. Please try again.');
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Subject title is required');
      return;
    }

    createSubjectMutation.mutate({
      title: title.trim()
    });
  };

  return (
    <PageLayout title={t('create_subject')}>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          {t('create_new_subject')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label={t('subject_title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            error={!!error && !title.trim()}
            helperText={!title.trim() && error ? error : ''}
          />
          {error && !error.includes('title') && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={createSubjectMutation.isPending}
          >
            {createSubjectMutation.isPending ? t('creating') : t('create_subject')}
          </Button>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default CreateSubjectPage; 