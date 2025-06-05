import { Box, Typography, Avatar } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { API_URL } from '../config';

interface NotificationProps {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  isRead: boolean;
  onClick?: () => void;
}

const Notification = ({ message, createdAt, sender, isRead, onClick }: NotificationProps) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid #22303c',
        bgcolor: isRead ? 'transparent' : '#192734',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          bgcolor: '#192734',
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          src={sender.avatar ? `${API_URL}${sender.avatar}` : undefined}
          alt={sender.nickname}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ color: '#fff' }}>
            <strong>{sender.nickname}</strong> {message}
          </Typography>
          <Typography variant="caption" sx={{ color: '#8899a6' }}>
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Notification; 