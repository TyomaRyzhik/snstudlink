import React, { useState, useRef } from 'react';
import { Box, Typography, Button, TextField, IconButton, MenuItem, Menu, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config';
import { showNotification } from '../../utils/notification';
import {
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  VideoFile as VideoIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  AddPhotoAlternate,
  Poll,
  MoreVert,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
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

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setContent('');
      setFiles([]);
      onPostCreated?.();
      showNotification('Post created successfully', 'success');
    },
    onError: () => {
      showNotification('Failed to create post', 'error');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('content', content);
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await createPostMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          showNotification(t('some_files_exceed_max_size'), 'warning');
          return false;
        }
        if (!allowedTypes.includes(file.type)) {
          showNotification(t('some_files_have_unsupported_format'), 'warning');
          return false;
        }
        return true;
      });

      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (type === 'image') return <ImageIcon />;
    if (type === 'video') return <VideoIcon />;
    if (ext === 'pdf') return <PdfIcon />;
    if (['doc', 'docx'].includes(ext || '')) return <DocIcon />;
    if (['xls', 'xlsx'].includes(ext || '')) return <ExcelIcon />;
    return <FileIcon />;
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handleRemovePollOption = (index: number) => {
    const newOptions = pollOptions.filter((_, i) => i !== index);
    setPollOptions(newOptions);
  };

  const handleSavePoll = () => {
    if (!pollQuestion.trim()) {
      showNotification(t('enter_poll_question'), 'warning');
      return;
    }
    if (pollOptions.some(option => !option.trim())) {
      showNotification(t('all_poll_options_must_be_filled'), 'warning');
      return;
    }
    setIsPollModalOpen(false);
    setAnchorEl(null);
  };

  const handleClosePollModal = () => {
    setIsPollModalOpen(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: '#15202b',
        borderRadius: 1,
        p: 2,
        mb: 2,
        color: 'white'
      }}
    >
      <TextField
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        disabled={isSubmitting}
        multiline
        rows={3}
        fullWidth
        variant="outlined"
        InputProps={{
          sx: { color: 'white' },
        }}
        sx={{
          textarea: { color: 'white' },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
        }}
      />

      {files.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {files.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                p: 1,
                color: 'white'
              }}
            >
              {getFileIcon(file)}
              <Typography variant="body2" sx={{ ml: 1, mr: 1, color: 'white' }}>
                {file.name}
              </Typography>
              <Button
                size="small"
                onClick={() => handleRemoveFile(index)}
                sx={{ minWidth: 'auto', p: 0.5, color: 'white' }}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          component="label"
          startIcon={<FileIcon sx={{ color: 'white' }} />}
          disabled={isSubmitting}
          sx={{ color: 'white' }}
        >
          {'Attach files'}
          <input
            type="file"
            hidden
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          />
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createPostMutation.isPending || (!content.trim() && files.length === 0 && !pollQuestion.trim())}
            sx={{
              bgcolor: 'white',
              color: '#15202b',
              '&:hover': {
                 bgcolor: '#f0f0f0',
              }
            }}
          >
            {createPostMutation.isPending ? t('posting') : t('post')}
          </Button>

          <Box sx={{ ml: 'auto' }}>
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            />
            <IconButton color="primary" onClick={handleFileSelect}>
              <AddPhotoAlternate />
            </IconButton>
            <IconButton color="primary" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { setIsPollModalOpen(true); handleMenuClose(); }}>
                <Poll sx={{ mr: 1 }} />
                {t('add_poll')}
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>

      <Dialog open={isPollModalOpen} onClose={handleClosePollModal}>
        <DialogTitle>{t('create_poll')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('poll_question')}
            type="text"
            fullWidth
            variant="standard"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
          />
          {pollOptions.map((option, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                margin="dense"
                label={`${t('poll_option')} ${index + 1}`}
                type="text"
                fullWidth
                variant="standard"
                value={option}
                onChange={(e) => handlePollOptionChange(index, e.target.value)}
              />
              {pollOptions.length > 2 && (
                <IconButton onClick={() => handleRemovePollOption(index)} size="small">
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button onClick={handleAddPollOption} sx={{ mt: 2 }}>
            {t('add_option')}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePollModal}>{t('cancel')}</Button>
          <Button onClick={handleSavePoll}>{t('save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreatePost;