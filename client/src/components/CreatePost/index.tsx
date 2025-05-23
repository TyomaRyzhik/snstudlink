import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Poll as PollIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  VideoFile as VideoIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import styles from './CreatePost.module.css';
import { API_URL } from '../../config';
import { TextField, Box, Button, IconButton, Typography } from '@mui/material';
import { showNotification } from '../../utils/notification';

const ACCEPTED_FILE_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico'],
  'video/*': ['.mp4', '.mov', '.avi'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CreatePost: React.FC<{ onPostCreated?: () => void }> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<Array<{ url: string; type: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0 && (!showPoll || !pollQuestion.trim())) {
      showNotification('Публикация не может быть пустой', 'error');
      return;
    }

    if (showPoll) {
      if (!pollQuestion.trim()) {
        showNotification('Введите вопрос для опроса', 'error');
        return;
      }
      if (pollOptions.some(option => !option.trim())) {
        showNotification('Все варианты ответа должны быть заполнены', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      
      media.forEach(file => {
        formData.append('media', file);
      });

      if (showPoll) {
        formData.append('poll', JSON.stringify({
          question: pollQuestion,
          options: pollOptions.map(text => ({ text, votes: 0 }))
        }));
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setContent('');
      setMedia([]);
      setMediaPreview([]);
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      showNotification('Публикация успешно создана', 'success');
      onPostCreated?.();
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      showNotification('Ошибка при создании публикации', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event fired.', e);
    if (e.target.files) {
      console.log('Files selected:', e.target.files);
      const newFiles = Array.from(e.target.files);
      console.log('New files array:', newFiles);

      // Проверка размера файлов
      const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        console.warn('Oversized files detected:', oversizedFiles);
        showNotification('Некоторые файлы превышают максимальный размер (10MB)', 'error');
        return;
      }

      // Проверка типа файлов
      const invalidFiles = newFiles.filter(file => {
        const fileType = file.type;
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        
        const isAccepted = Object.entries(ACCEPTED_FILE_TYPES).some(([acceptedType, extensions]) => {
          if (acceptedType.endsWith('/*')) {
            // Handle wildcard types like 'image/*'
            const baseType = acceptedType.slice(0, -2); // Get 'image'
            return fileType.startsWith(baseType + '/') && extensions.some(ext => fileExtension === ext.slice(1)); // Check if type starts with 'image/' AND extension is in the list
          } else {
            // Handle specific types like 'application/pdf'
            return fileType === acceptedType; // Check if type matches exactly
          }
        });

        console.log(`Checking file: ${file.name}, type: ${fileType}, extension: ${fileExtension}, accepted: ${isAccepted}`);
        return !isAccepted;
      });

      if (invalidFiles.length > 0) {
        console.warn('Invalid files detected:', invalidFiles);
        showNotification('Некоторые файлы имеют неподдерживаемый формат', 'error');
        return;
      }

      setMedia(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name
      }));
      setMediaPreview(prev => [
        ...prev,
        ...newPreviews
      ]);
      console.log('New files selected and preview generated:', newPreviews);
      console.log('Updated mediaPreview state:', mediaPreview);
    }
  };

  const handleRemoveFile = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type.startsWith('video/')) return <VideoIcon />;
    if (type === 'application/pdf') return <PdfIcon />;
    if (type.includes('word')) return <DocIcon />;
    if (type.includes('excel')) return <ExcelIcon />;
    return <FileIcon />;
  };

  const renderMediaPreview = (preview: { url: string; type: string; name: string }, index: number) => {
    console.log('Rendering media preview for:', preview);

    return (
      <div key={index} className={styles.filePreview}>
        <div className={styles.fileIcon}>
          {getFileIcon(preview.type)}
        </div>
        <Typography variant="body2" className={styles.fileName}>
          {preview.name}
        </Typography>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => handleRemoveFile(index)}
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className={styles.createPost}>
      <div className={styles.postForm}>
        <img
          src={user?.avatar ? `${API_URL}${user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`}` : '/unknown-user.svg'}
          alt={user?.nickname}
          className={styles.avatar}
        />
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={styles.textarea}
            placeholder="Что происходит?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={showPoll ? 1 : 3}
          />
          {showPoll && (
            <div className={styles.pollInputs}>
              <TextField
                fullWidth
                variant="outlined"
                label="Вопрос опроса"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                margin="normal"
                size="small"
                className={styles.pollInput}
              />
              {pollOptions.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={`Вариант ${index + 1}`}
                    value={option}
                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                    margin="normal"
                    size="small"
                    className={styles.pollInput}
                  />
                  {pollOptions.length > 2 && (
                    <IconButton onClick={() => handleRemovePollOption(index)} size="small">
                      ×
                    </IconButton>
                  )}
                </Box>
              ))}
              {pollOptions.length < 4 && (
                <Button 
                  onClick={handleAddPollOption} 
                  startIcon={<AddIcon />}
                  className={styles.addOptionButton}
                >
                  Добавить вариант
                </Button>
              )}
            </div>
          )}
          {mediaPreview.length > 0 && (
            <div className={styles.mediaPreview}>
              {mediaPreview.map((preview, index) => renderMediaPreview(preview, index))}
            </div>
          )}
          <div className={styles.postActions}>
            <div className={styles.actionButtons}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
                multiple
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.actionButton}
              >
                <ImageIcon />
              </button>
              <button
                type="button"
                onClick={() => setShowPoll(!showPoll)}
                className={`${styles.actionButton} ${showPoll ? styles.active : ''}`}
              >
                <PollIcon />
              </button>
            </div>
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={(!content.trim() && media.length === 0 && (!showPoll || !pollQuestion.trim() || pollOptions.some(opt => !opt.trim()))) || isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Твитнуть'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;