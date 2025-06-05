import { useQuery } from '@tanstack/react-query';
import { Box, Typography, CircularProgress } from '@mui/material';
import { API_URL } from '../config';
import { useTranslation } from 'react-i18next';

interface Conference {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: string[];
  createdBy: string;
}

const ConferenceList = () => {
  const { t } = useTranslation();
  const { data: conferences, isLoading, error } = useQuery<Conference[]>({
    queryKey: ['conferences'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/conferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error fetching conferences:', errorData);
        throw new Error(errorData?.message || 'Failed to fetch conferences');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{t('failed_to_load_conferences')}</Typography>
      </Box>
    );
  }

  if (!conferences || !Array.isArray(conferences) || conferences.length === 0) {
    return (
      <Box p={2}>
        <Typography color="text.secondary">{t('no_conferences_found')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {conferences.map((conference) => (
        <Box
          key={conference.id}
          sx={{
            p: 2,
            borderBottom: '1px solid #22303c',
            '&:hover': {
              bgcolor: '#192734',
            },
          }}
        >
          <Typography variant="h6" sx={{ color: '#fff' }}>{conference.title}</Typography>
          <Typography variant="body2" sx={{ color: '#8899a6' }}>{conference.description}</Typography>
          <Typography variant="caption" sx={{ color: '#8899a6' }}>
            {new Date(conference.startTime).toLocaleString()} - {new Date(conference.endTime).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ConferenceList; 