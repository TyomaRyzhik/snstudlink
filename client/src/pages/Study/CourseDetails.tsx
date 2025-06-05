import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { API_URL } from '../../config';
import { Lecture, Assignment } from '../../types';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      return response.json();
    },
    enabled: !!courseId,
  });

  const deleteLectureMutation = useMutation({
    mutationFn: async (lectureId: string) => {
      const response = await fetch(`${API_URL}/api/lectures/${lectureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete lecture');
      }
    },
    onSuccess: () => {
      // Refetch course data
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await fetch(`${API_URL}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }
    },
    onSuccess: () => {
      // Refetch course data
    },
  });

  if (courseLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5">Course not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{course.title}</Typography>
      <Typography variant="body1">{course.description}</Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} centered>
        <Tab label="Lectures" />
        <Tab label="Assignments" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              // Handle add lecture
            }}
          >
            Add Lecture
          </Button>
          {course.lectures?.map((lecture: Lecture) => (
            <Box key={lecture.id} mt={2}>
              <Typography variant="h6">{lecture.title}</Typography>
              <Typography variant="body2">{lecture.description}</Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={() => {
                  // Handle edit lecture
                }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => deleteLectureMutation.mutate(lecture.id)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              // Handle add assignment
            }}
          >
            Add Assignment
          </Button>
          {course.assignments?.map((assignment: Assignment) => (
            <Box key={assignment.id} mt={2}>
              <Typography variant="h6">{assignment.title}</Typography>
              <Typography variant="body2">{assignment.description}</Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={() => {
                  // Handle edit assignment
                }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CourseDetails; 