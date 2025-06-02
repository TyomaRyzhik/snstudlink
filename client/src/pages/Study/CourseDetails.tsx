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
  Link as MuiLink,
  ListItemSecondaryAction
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
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

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
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCourse(response.data);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(t('failed_to_load_course_data'));
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, t]);

  // Fetch lectures
  const { data: lectures, isLoading: isLecturesLoading } = useQuery<Lecture[]>({
    queryKey: ['lectures', courseId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/api/lectures/course/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });

  // Fetch assignments
  const { data: assignments, isLoading: isAssignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/api/assignments/course/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });

  // Create lecture mutation
  const createLectureMutation = useMutation<Lecture, Error, Partial<Lecture>>({
    mutationFn: async (newLecture) => {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/api/lectures`,
        {
          ...newLecture,
          courseId,
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', courseId] });
      setCreateLectureModalOpen(false);
    },
    onError: (error) => {
      setError(t('failed_to_create_lecture'));
    },
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation<Assignment, Error, Partial<Assignment>>({
    mutationFn: async (newAssignment) => {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/api/assignments`,
        {
          ...newAssignment,
          courseId,
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
      setCreateAssignmentModalOpen(false);
    },
    onError: (error) => {
      setError(t('failed_to_create_assignment'));
    },
  });

  // Update lecture mutation
  const updateLectureMutation = useMutation<Lecture, Error, Partial<Lecture>>({
    mutationFn: async (updatedLecture) => {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_URL}/api/lectures/${selectedLecture?.id}`,
        updatedLecture,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', courseId] });
      setEditLectureModalOpen(false);
      setSelectedLecture(null);
    },
    onError: (error) => {
      setError(t('failed_to_update_lecture'));
    },
  });

  // Delete lecture mutation
  const deleteLectureMutation = useMutation<void, Error, string>({
    mutationFn: async (lectureId) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/lectures/${lectureId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures', courseId] });
    },
    onError: (error) => {
      setError(t('failed_to_delete_lecture'));
    },
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation<Assignment, Error, Partial<Assignment>>({
    mutationFn: async (updatedAssignment) => {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_URL}/api/assignments/${selectedAssignment?.id}`,
        updatedAssignment,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
      setEditAssignmentModalOpen(false);
      setSelectedAssignment(null);
    },
    onError: (error) => {
      setError(t('failed_to_update_assignment'));
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation<void, Error, string>({
    mutationFn: async (assignmentId) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/assignments/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
    },
    onError: (error) => {
      setError(t('failed_to_delete_assignment'));
    },
  });

  // Check if the user has permission to edit/add (Teacher or Super Admin)
  const canEdit = user?.role === 'teacher' || user?.role === 'super-admin';

  if (loading) {
    return (
      <PageLayout title={t('loading')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={t('error')}>
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout title={t('course_not_found')}>
        <Typography align="center" sx={{ mt: 4 }}>
          {t('course_not_found_message')}
        </Typography>
      </PageLayout>
    );
  }

  const handleEditLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setEditLectureModalOpen(true);
  };

  const handleDeleteLecture = (lectureId: string) => {
    if (window.confirm(t('confirm_delete_lecture'))) {
      deleteLectureMutation.mutate(lectureId);
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setEditAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm(t('confirm_delete_assignment'))) {
      deleteAssignmentMutation.mutate(assignmentId);
    }
  };

  return (
    <PageLayout title={course.title}>
      <Container maxWidth="md">
        <Card>
          {course.imageUrl && (
            <CardMedia
              component="img"
              height="300"
              image={`${API_URL}${course.imageUrl}`}
              alt={course.title}
            />
          )}
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            {course.category && <Typography variant="subtitle1" color="text.secondary">{t('category')}: {course.category}</Typography>}
            {course.level && <Typography variant="subtitle1" color="text.secondary">{t('level')}: {course.level}</Typography>}
            {course.duration && <Typography variant="subtitle1" color="text.secondary">{t('duration')}: {course.duration}</Typography>}
            
            <Typography variant="body1" sx={{ mt: 2 }}>
              {course.description}
            </Typography>

            {course.teachers && course.teachers.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>{t('teacher')}{course.teachers.length > 1 ? t('plural_suffix') : ''}:</Typography>
                <List>
                  {course.teachers.map(teacher => (
                    <ListItem key={teacher.id} disableGutters>
                      <Avatar src={teacher.avatar ? `${API_URL}${teacher.avatar}` : undefined} sx={{ mr: 2 }} />
                      <ListItemText
                        primary={teacher.name || teacher.nickname}
                        secondary={teacher.name ? teacher.nickname : ''}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Box sx={{ width: '100%', mt: 4 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
                <Tab label={t('lectures')} />
                <Tab label={t('assignments')} />
              </Tabs>
              <Box sx={{ pt: 3 }}>
                {activeTab === 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{t('lectures')}</Typography>
                      {canEdit && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => setCreateLectureModalOpen(true)}
                        >
                          {t('add_lecture')}
                        </Button>
                      )}
                    </Box>
                    {isLecturesLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>
                    ) : lectures && lectures.length > 0 ? (
                      <List>
                        {lectures.map(lecture => (
                          <ListItem key={lecture.id} divider>
                            <ListItemIcon>
                              <VideoIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={<MuiLink component={Link} to={`/study/lesson/${lecture.id}`} underline="hover">{lecture.title}</MuiLink>}
                              secondary={lecture.description}
                            />
                            <ListItemSecondaryAction>
                              {canEdit && (
                                <>
                                  <Tooltip title={t('edit')}>
                                    <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }} onClick={() => handleEditLecture(lecture)}>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('delete')}>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteLecture(lecture.id)}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography>{t('no_lectures_available')}</Typography>
                    )}
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{t('assignments')}</Typography>
                      {canEdit && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => setCreateAssignmentModalOpen(true)}
                        >
                          {t('add_assignment')}
                        </Button>
                      )}
                    </Box>
                     {isAssignmentsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>
                    ) : assignments && assignments.length > 0 ? (
                      <List>
                        {assignments.map(assignment => (
                          <ListItem key={assignment.id} divider>
                            <ListItemIcon>
                              <AssignmentIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={assignment.title}
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">{t('type')}: {assignment.type}</Typography>
                                  <Typography variant="body2" color="text.secondary">{t('status')}: {assignment.status}</Typography>
                                  {assignment.dueDate && <Typography variant="body2" color="text.secondary">{t('due_date')}: {new Date(assignment.dueDate).toLocaleDateString()}</Typography>}
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              {canEdit && (
                                <>
                                   <Tooltip title={t('edit')}>
                                    <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }} onClick={() => handleEditAssignment(assignment)}>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('delete')}>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAssignment(assignment.id)}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography>{t('no_assignments_available')}</Typography>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {/* Create Lecture Modal */}
            <Dialog open={createLectureModalOpen} onClose={() => setCreateLectureModalOpen(false)}>
              <DialogTitle>{t('create_lecture')}</DialogTitle>
              <DialogContent>
                <TextField autoFocus margin="dense" label={t('lecture_title')} fullWidth />
                <TextField margin="dense" label={t('description')} fullWidth multiline rows={4} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCreateLectureModalOpen(false)}>{t('cancel')}</Button>
                <Button color="primary">{t('create')}</Button>
              </DialogActions>
            </Dialog>

            {/* Create Assignment Modal */}
             <Dialog open={createAssignmentModalOpen} onClose={() => setCreateAssignmentModalOpen(false)}>
              <DialogTitle>{t('create_assignment')}</DialogTitle>
              <DialogContent>
                <TextField autoFocus margin="dense" label={t('assignment_title')} fullWidth />
                <TextField margin="dense" label={t('description')} fullWidth multiline rows={4} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCreateAssignmentModalOpen(false)}>{t('cancel')}</Button>
                <Button color="primary">{t('create')}</Button>
              </DialogActions>
            </Dialog>

             {/* Edit Lecture Modal - Placeholder */}
            <Dialog open={editLectureModalOpen} onClose={() => setEditLectureModalOpen(false)}>
              <DialogTitle>{t('edit_lecture')}</DialogTitle>
              <DialogContent>
                <Typography>{t('edit_lecture_modal_placeholder')}</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditLectureModalOpen(false)}>{t('cancel')}</Button>
                <Button color="primary">{t('save')}</Button>
              </DialogActions>
            </Dialog>

            {/* Edit Assignment Modal - Placeholder */}
             <Dialog open={editAssignmentModalOpen} onClose={() => setEditAssignmentModalOpen(false)}>
              <DialogTitle>{t('edit_assignment')}</DialogTitle>
              <DialogContent>
                 <Typography>{t('edit_assignment_modal_placeholder')}</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditAssignmentModalOpen(false)}>{t('cancel')}</Button>
                <Button color="primary">{t('save')}</Button>
              </DialogActions>
            </Dialog>

          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default CourseDetails; 