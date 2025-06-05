import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { API_URL } from '../../config';

const LessonDetails = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      return response.json();
    },
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5">Lesson not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{lesson.name}</Typography>
      <Typography variant="body1">{lesson.description}</Typography>
      {lesson.files && lesson.files.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6">Files</Typography>
          {lesson.files.map((file: any) => (
            <Button
              key={file.id}
              href={`${API_URL}/api/files/${file.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.filename}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default LessonDetails; 