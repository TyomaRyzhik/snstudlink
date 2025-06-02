import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CourseCard.module.css';
import { Typography, Box } from '@mui/material';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    // Add other fields if needed for the card display
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Link to={`/study/${course.id}`} className={styles.cardLink}>
      <Box className={styles.card}>
        <Typography variant="h6" className={styles.title}>
          {course.title}
        </Typography>
        {course.description && (
          <Typography variant="body2" className={styles.description}>
            {course.description}
          </Typography>
        )}
        {/* Add more details as needed */}
      </Box>
    </Link>
  );
};

export default CourseCard; 