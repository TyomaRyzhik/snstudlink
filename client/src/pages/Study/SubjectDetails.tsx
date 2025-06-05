import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { API_URL } from '../../config';
import type { Lesson } from '../../types';

const SubjectDetails = () => {
  const { subjectId } = useParams<{ subjectId: string }>();

  const { data: subject, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/subjects/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subject');
      }
      return response.json();
    },
    enabled: !!subjectId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!subject) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5">Subject not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{subject.title}</Typography>
      <Typography variant="body1">{subject.description}</Typography>

      {subject.lessons && subject.lessons.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6">Lessons</Typography>
          <List>
            {subject.lessons.map((lesson: Lesson) => (
              <ListItem key={lesson.id}>
                <ListItemText
                  primary={lesson.name}
                  secondary={lesson.description}
                />
                <Button
                  href={`/study/lesson/${lesson.id}`}
                  variant="contained"
                  color="primary"
                >
                  View Lesson
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default SubjectDetails; 