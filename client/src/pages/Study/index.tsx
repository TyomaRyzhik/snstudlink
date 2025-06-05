import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../config';
import PageLayout from '../../components/PageLayout';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import SubjectCard from '../../components/SubjectCard';
import { Subject } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Study Page component to display list of subjects
const StudyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Temporary log to check user role
  console.log('Current user role:', user?.role);

  const [searchQuery, setSearchQuery] = useState('');

  const { t } = useTranslation();

  const { data: subjects, isLoading, error } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  const handleCreateSubjectClick = () => {
    navigate('/study/subject/create');
  };

  const filteredSubjects = subjects?.filter(subject =>
    subject.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <PageLayout title={t('study')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={t('study')}>
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {t('error_loading_subjects')}
        </Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('study')}
      actions={[
        <Button
          key="create-subject"
          variant="contained"
          color="primary"
          onClick={handleCreateSubjectClick}
          sx={{ ml: 2 }}
        >
          {t('add_subject')}
        </Button>
      ]}
    >
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('search_subjects')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {!filteredSubjects || filteredSubjects.length === 0 ? (
        <Typography align="center" sx={{ mt: 4 }}>
          {t('no_subjects_found')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredSubjects.map(subject => (
            <Grid item xs={12} sm={6} md={4} key={subject.id}>
              <SubjectCard subject={subject} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
};

export default StudyPage;
