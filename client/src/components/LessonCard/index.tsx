import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { 
  InsertDriveFile as FileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { Lesson } from '../../types';

interface LessonCardProps {
  lesson: Lesson;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
  showActions?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ 
  lesson, 
  onEdit, 
  onDelete,
  showActions = false 
}) => {
  return (
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
      <Link to={`/study/lesson/${lesson.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {lesson.name}
            </Typography>
            {showActions && (
              <Box onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <IconButton size="small" onClick={() => onEdit(lesson)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton size="small" onClick={() => onDelete(lesson)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {lesson.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FileIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {lesson.files?.length || 0} файлов
            </Typography>
          </Box>
        </CardContent>
      </Link>
    </Card>
  );
};

export default LessonCard; 