import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { API_URL } from '../../config';

const CreateCoursePage = () => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const response = await fetch(`${API_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create course');
      }
      return response.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCourseMutation.mutate(courseData);
  };

  if (createCourseMutation.isPending) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">Create New Course</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Course Title"
          value={courseData.title}
          onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Course Description"
          value={courseData.description}
          onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
          margin="normal"
          multiline
          rows={4}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={createCourseMutation.isPending}
        >
          Create Course
        </Button>
      </form>
    </Box>
  );
};

export default CreateCoursePage; 