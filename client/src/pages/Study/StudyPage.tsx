import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import PageLayout from '../../components/PageLayout';

interface Teacher {
  id: string;
  nickname: string;
  name?: string; // Assuming name might be optional
  avatar?: string | null; // Assuming avatar might be optional or null
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null; // Assuming imageUrl might be optional or null
  category?: string; // Assuming category might be optional
  level?: string; // Assuming level might be optional
  duration?: string; // Assuming duration might be optional
  teachers: Teacher[];
}

const StudyPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Не удалось загрузить курсы.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    course.teachers.some(teacher =>
      teacher.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.name && teacher.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  if (loading) {
    return (
      <PageLayout title="Учёба">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Учёба">
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Учёба">
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск курсов..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
                onClick={() => navigate(`/study/course/${course.id}`)}
              >
                {course.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={`http://localhost:3001${course.imageUrl}`}
                    alt={course.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 1 }}>
                    {course.category && <Chip label={course.category} size="small" sx={{ mr: 1 }} />}
                    {course.level && <Chip label={course.level} size="small" color="primary" />}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                  {course.teachers && course.teachers.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      {/* Displaying the first teacher's avatar and name/nickname */}
                      {course.teachers[0].avatar && (
                        <Box
                          component="img"
                          src={`http://localhost:3001${course.teachers[0].avatar}`}
                          alt={course.teachers[0].name || course.teachers[0].nickname}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            mr: 1,
                          }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {course.teachers[0].name || course.teachers[0].nickname}
                        {course.teachers.length > 1 && ` + ${course.teachers.length - 1} more`}
                      </Typography>
                      {course.duration && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                          {course.duration}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </PageLayout>
  );
};

export default StudyPage; 