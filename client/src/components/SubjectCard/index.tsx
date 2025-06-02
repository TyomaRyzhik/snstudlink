import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Subject } from '../../types';

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  return (
    <Link to={`/study/subject/${subject.id}`} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: 3,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {subject.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subject.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${subject.lessons?.length || 0} уроков`} 
              size="small" 
              color="primary" 
            />
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SubjectCard; 