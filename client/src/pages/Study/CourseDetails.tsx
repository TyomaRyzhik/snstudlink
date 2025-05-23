import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  AvatarGroup,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Container,
  Card,
  CardContent,
  CardMedia,
  Link as MuiLink
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../../config';
import PageLayout from '../../components/PageLayout';
import { Link } from 'react-router-dom';

interface Teacher {
  id: string;
  nickname: string;
  name?: string;
  avatar?: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  category?: string;
  level?: string;
  duration?: string;
  teachers: Teacher[];
  // Add other course details here, e.g., lectures, assignments
}

interface Lecture {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  slidesUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: 'homework' | 'quiz' | 'project' | 'exam';
  status: 'draft' | 'published' | 'closed';
  dueDate?: string;
  maxScore?: number;
  instructions?: string;
  submissionInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [createLectureModalOpen, setCreateLectureModalOpen] = useState(false);
  const [createAssignmentModalOpen, setCreateAssignmentModalOpen] = useState(false);
  const [editLectureModalOpen, setEditLectureModalOpen] = useState(false);
  const [editAssignmentModalOpen, setEditAssignmentModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const queryClient = useQueryClient();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCourse(response.data);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Не удалось загрузить данные курса.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Fetch lectures
  const { data: lectures, isLoading: isLecturesLoading } = useQuery<Lecture[]>({
    queryKey: ['lectures', courseId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/api/lectures/course/${courseId}`);
      return data;
    },
  });

  // Fetch assignments
  const { data: assignments, isLoading: isAssignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/api/assignments/course/${courseId}`);
      return data;
    },
  });

  // Create lecture mutation
  const createLectureMutation = useMutation<Lecture, Error, Partial<Lecture>>({
    mutationFn: async (newLecture) => {
      const { data } = await axios.post(`${API_URL}/api/lectures`, {
        ...newLecture,
        courseId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', courseId] });
      setCreateLectureModalOpen(false);
    },
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation<Assignment, Error, Partial<Assignment>>({
    mutationFn: async (newAssignment) => {
      const { data } = await axios.post(`${API_URL}/api/assignments`, {
        ...newAssignment,
        courseId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
      setCreateAssignmentModalOpen(false);
    },
  });

  // Update lecture mutation
  const updateLectureMutation = useMutation<Lecture, Error, Partial<Lecture>>({
    mutationFn: async (updatedLecture) => {
      const { data } = await axios.put(`${API_URL}/api/lectures/${selectedLecture?.id}`, updatedLecture);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', courseId] });
      setEditLectureModalOpen(false);
      setSelectedLecture(null);
    },
  });

  // Delete lecture mutation
  const deleteLectureMutation = useMutation<void, Error, string>({
    mutationFn: async (lectureId) => {
      await axios.delete(`${API_URL}/api/lectures/${lectureId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', courseId] });
    },
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation<Assignment, Error, Partial<Assignment>>({
    mutationFn: async (updatedAssignment) => {
      const { data } = await axios.put(`${API_URL}/api/assignments/${selectedAssignment?.id}`, updatedAssignment);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
      setEditAssignmentModalOpen(false);
      setSelectedAssignment(null);
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation<void, Error, string>({
    mutationFn: async (assignmentId) => {
      await axios.delete(`${API_URL}/api/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
    },
  });

  if (loading) {
    return (
      <PageLayout title="Загрузка...">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Ошибка">
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout title="Курс не найден">
        <Typography align="center" sx={{ mt: 4 }}>
          Курс с указанным ID не найден.
        </Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={course.title}>
      <Container maxWidth="md">
        <Card>
          {course.imageUrl && (
            <CardMedia
              component="img"
              height="300"
              image={`http://localhost:3001${course.imageUrl}`}
              alt={course.title}
            />
          )}
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            {course.category && <Typography variant="subtitle1" color="text.secondary">Категория: {course.category}</Typography>}
            {course.level && <Typography variant="subtitle1" color="text.secondary">Уровень: {course.level}</Typography>}
            {course.duration && <Typography variant="subtitle1" color="text.secondary">Длительность: {course.duration}</Typography>}
            
            <Typography variant="body1" sx={{ mt: 2 }}>
              {course.description}
            </Typography>

            {course.teachers && course.teachers.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Преподаватель{course.teachers.length > 1 ? 'и' : ''}:</Typography>
                <List>
                  {course.teachers.map(teacher => (
                    <ListItem key={teacher.id} disableGutters>
                      <Avatar src={teacher.avatar ? `http://localhost:3001${teacher.avatar}` : undefined} sx={{ mr: 2 }} />
                      <ListItemText
                        primary={teacher.name || teacher.nickname}
                        secondary={teacher.name ? teacher.nickname : ''}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Add sections for Lectures, Assignments, etc. here */}

          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default CourseDetails; 