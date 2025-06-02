import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config';
import PageLayout from '../../components/PageLayout';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Lesson, File } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const LessonDetails: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
    },
    onError: (error) => {
      setError('Failed to delete file. Please try again.');
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/lessons/${lessonId}/files`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
    } catch (error) {
      setError('Failed to upload file. Please try again.');
    }
  };

  const handleFileDownload = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}${file.path}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to download file. Please try again.');
    }
  };

  const handleDeleteFile = (file: File) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteFileMutation.mutate(file.id);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!lesson) {
    return (
      <PageLayout title="Lesson Not Found">
        <Typography align="center" sx={{ mt: 4 }}>
          The requested lesson could not be found.
        </Typography>
      </PageLayout>
    );
  }

  const canEdit = user?.role === 'teacher' || user?.role === 'super-admin';

  return (
    <PageLayout
      title={lesson.name}
      actions={
        canEdit ? [
          <Button
            key="upload-file"
            variant="contained"
            color="primary"
            component="label"
            startIcon={<UploadIcon />}
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        ] : undefined
      }
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {lesson.description}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Files
          </Typography>
          {lesson.files && lesson.files.length > 0 ? (
            <List>
              {lesson.files.map((file) => (
                <ListItem key={file.id}>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.filename}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleFileDownload(file)}
                      sx={{ mr: 1 }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    {canEdit && (
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteFile(file)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              No files uploaded yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default LessonDetails; 