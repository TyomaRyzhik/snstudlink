import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleOutline as CommentIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './Post.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { showNotification } from '../../utils/notification';
import { API_URL } from '../../config';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Modal from '../Modal';
import Textarea from '../Textarea';
import Button from '../Button';
import { Post as PostType, Comment as CommentType } from '../../types';

interface PostProps extends PostType {
  onLike?: () => void;
  onComment?: (newCommentsCount: number) => void;
  onDelete?: () => void;
}

const Post: React.FC<PostProps> = ({
  id,
  content,
  media = [],
  author,
  commentsCount = 0,
  createdAt,
  isLiked,
  onLike,
  onComment,
  onDelete,
  poll = null,
  likesCount,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [pollResults, setPollResults] = useState<{ text: string; votes: number; percentage: number; voterIds?: string[] }[]>([]);

  useEffect(() => {
    if (isCommentModalOpen) {
      fetch(`${API_URL}/api/posts/${id}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(() => setComments([]));
    }
  }, [isCommentModalOpen, id]);

  const handleLike = async () => {
    if (!user) {
      showNotification('Необходимо войти в систему', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      onLike?.(); // Let the parent component handle the state update based on the server response
    } catch (error) {
      console.error('[Post] handleLike error:', error);
      showNotification('Ошибка при лайке публикации', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = async () => { // Corrected signature
    if (!user) {
      showNotification('Необходимо войти в систему', 'warning');
      return;
    }

    if (!commentText.trim()) {
      showNotification('Комментарий не может быть пустым', 'warning');
      return;
    }

    try {
      setIsCommentSubmitting(true);
      const response = await fetch(`${API_URL}/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();
      setComments(prevComments => [...prevComments, newComment]);
      setCommentText('');
      onComment?.(newComment.commentsCount); // Use newComment.commentsCount
    } catch (error) {
      showNotification('Ошибка при добавлении комментария', 'error');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== author.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      onDelete?.();
      showNotification('Публикация успешно удалена', 'success');
    } catch (error) {
      showNotification('Ошибка при удалении публикации', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!user) {
      showNotification('Необходимо войти в систему', 'warning');
      return;
    }

    if (hasVoted) {
      showNotification('Вы уже проголосовали в этом опросе', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/poll/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionIndex }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      setHasVoted(true);
      setSelectedPollOption(optionIndex);
      
      // Обновляем результаты опроса
      const updatedPoll = await response.json();
      const totalVotes = updatedPoll.options.reduce((sum: number, option: any) => sum + option.votes, 0);
      const results = updatedPoll.options.map((option: any) => ({
        text: option.text,
        votes: option.votes,
        percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
        voterIds: option.voterIds,
      }));
      setPollResults(results);
    } catch (error) {
      showNotification('Ошибка при голосовании', 'error');
    }
  };

  const renderMedia = (mediaItem: { path: string; type: string } | string, index: number) => {
    const mediaPath = typeof mediaItem === 'string' ? mediaItem : mediaItem.path;
    const mediaType = typeof mediaItem === 'string' ? 'image' : mediaItem.type;
    const fileName = mediaPath.split('/').pop() || mediaPath;

    const getFileIcon = (type: string) => {
      switch (type) {
        case 'application/pdf':
          return PdfIcon;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return DocIcon;
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return ExcelIcon;
        default:
          return FileIcon;
      }
    };

    const handleDownload = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Необходимо войти в систему для скачивания файлов', 'warning');
        return;
      }

      const downloadUrl = `${API_URL}${mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`}?token=${token}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    if (mediaType.startsWith('image')) {
      return (
        <div key={index} className={styles.mediaItem}>
          <img src={`${API_URL}${mediaPath}`} alt="post media" />
        </div>
      );
    } else if (mediaType.startsWith('video')) {
      return (
        <div key={index} className={styles.mediaItem}>
          <video controls src={`${API_URL}${mediaPath}`} />
        </div>
      );
    } else if (mediaType.startsWith('application')) {
      const IconComponent = getFileIcon(mediaType);
      return (
        <div key={index} className={styles.filePreview}>
          <div className={styles.fileIcon}>
            <IconComponent />
          </div>
          <span className={styles.fileName}>{fileName}</span>
          <button onClick={handleDownload} className={styles.downloadButton}>
            <DownloadIcon />
          </button>
        </div>
      );
    } else {
      return (
        <div key={index} className={styles.filePreview}>
          <div className={styles.fileIcon}>
            <FileIcon />
          </div>
          <span className={styles.fileName}>{fileName}</span>
          <button onClick={handleDownload} className={styles.downloadButton}>
            <DownloadIcon />
          </button>
        </div>
      );
    }
  };

  return (
    <article className={styles.post}>
      <div className={styles.postContent}>
        <Link to={`/profile/${author.id}`} className={styles.avatarLink}>
          <img
            src={author.avatar ? `${API_URL}${author.avatar.startsWith('/') ? author.avatar : `/${author.avatar}`}` : '/unknown-user.svg'}
            alt={author.nickname || 'Пользователь'}
            className={styles.avatar}
          />
        </Link>
        <div className={styles.postMain}>
          <div className={styles.postHeader}>
            <Link to={`/profile/${author.id}`} className={styles.authorName}>
              {author.nickname}
            </Link>
            <span className={styles.postTime}>
              {(() => {
                try {
                  const date = new Date(createdAt);
                  if (!createdAt || isNaN(date.getTime())) {
                    return 'Нет даты';
                  }
                  return formatDistanceToNow(date, { addSuffix: true, locale: ru });
                } catch (error) {
                  console.error('Error formatting date:', error);
                  return 'Нет даты';
                }
              })()}
            </span>
            {user && user.id === author.id && (
              <button className={styles.deleteButton} onClick={handleDelete}>
                <DeleteIcon />
              </button>
            )}
          </div>
          <div className={styles.postText}>{content}</div>
          {Array.isArray(media) && media.length > 0 && (
            <div className={styles.mediaContainer}>
              {media.map((mediaItem, index) => renderMedia(mediaItem, index))}
            </div>
          )}
          {poll && (
            <div className={styles.pollContainer}>
              <h4>{poll.question}</h4>
              <div className={styles.pollOptions}>
                {poll.options.map((option, index) => {
                  const isSelected = selectedPollOption === index;
                  const result = pollResults[index];
                  const percentage = result ? result.percentage : 0;

                  return (
                    <div
                      key={index}
                      className={`${styles.pollOption} ${isSelected ? styles.selected : ''}`}
                      onClick={() => !hasVoted && handleVote(index)}
                    >
                      <div className={styles.pollOptionText}>{option.text}</div>
                      {hasVoted && (
                        <div className={styles.pollResults}>
                          <div
                            className={styles.pollBar}
                            style={{ width: `${percentage}%` }}
                          />
                          <span className={styles.pollPercentage}>
                            {percentage.toFixed(1)}%
                          </span>
                          <span className={styles.pollVotes}>
                            {option.votes} голосов
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className={styles.postActions}>
            <button
              className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <ThumbUpIcon />
              <span>{likesCount || 0}</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setIsCommentModalOpen(true)}
            >
              <CommentIcon />
              <span>{commentsCount}</span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="Комментарии"
      >
        <div className={styles.commentsContainer}>
          {comments.map((comment: any) => {
            if (!comment.sender || !comment.sender.id) {
              return (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor} style={{ color: '#aaa' }}>
                      Неизвестный пользователь
                    </span>
                    <span className={styles.commentTime}>
                      {((() => {
                        const date = new Date(comment.createdAt);
                        if (!comment.createdAt || isNaN(date.getTime())) {
                          return 'Нет даты';
                        }
                        try {
                          return formatDistanceToNow(date, { addSuffix: true, locale: ru });
                        } catch (error) {
                          return 'Нет даты';
                        }
                      })())}
                    </span>
                  </div>
                  <div className={styles.commentContent}>{comment.content}</div>
                </div>
              );
            }
            return (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <Link to={`/profile/${comment.sender.id}`} className={styles.commentAuthor}>
                    {comment.sender.nickname}
                  </Link>
                  <span className={styles.commentTime}>
                    {((() => {
                      const date = new Date(comment.createdAt);
                      if (!comment.createdAt || isNaN(date.getTime())) {
                        return 'Нет даты';
                      }
                      try {
                        return formatDistanceToNow(date, { addSuffix: true, locale: ru });
                      } catch (error) {
                        return 'Нет даты';
                      }
                    })())}
                  </span>
                </div>
                <div className={styles.commentContent}>{comment.content}</div>
              </div>
            );
          })}
          <div className={styles.addComment}>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Написать комментарий..."
              disabled={isCommentSubmitting}
            />
            <Button
              onClick={handleComment}
              disabled={isCommentSubmitting || !commentText.trim()}
            >
              {isCommentSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </div>
      </Modal>
    </article>
  );
};

export default Post; 