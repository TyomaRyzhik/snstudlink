import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleOutline as CommentIcon,
  Repeat as RetweetIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
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

interface PostProps {
  id: string;
  content: string;
  media?: Array<{
    id: string;
    type: string;
    path: string;
    createdAt: string;
  }>;
  author: {
    id: string;
    nickname: string;
    avatar?: string | null;
  };
  likes?: string[];
  commentsCount?: number;
  retweetsCount?: number;
  createdAt: string;
  isRetweeted?: boolean;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRetweet?: () => void;
  onDelete?: () => void;
  poll?: {
    question: string;
    options: {
      text: string;
      votes: number;
      voterIds?: string[];
    }[];
    votes?: string[];
  } | null;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

const Post: React.FC<PostProps> = ({
  id,
  content,
  media = [],
  author,
  likes = [],
  commentsCount = 0,
  retweetsCount = 0,
  createdAt,
  isRetweeted: initialIsRetweeted = false,
  isLiked: initialIsLiked = false,
  onLike,
  onComment,
  onRetweet,
  onDelete,
  poll = null,
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isRetweeted, setIsRetweeted] = useState(initialIsRetweeted);
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

  useEffect(() => {
    if (poll && user) {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
      const results = poll.options.map(option => ({
        ...option,
        percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
      }));
      setPollResults(results);

      let userVotedForOption = false;
      let votedOptionIndex: number | null = null;

      for (let i = 0; i < poll.options.length; i++) {
        const option = poll.options[i];
        if (option.voterIds?.includes(user.id)) {
          userVotedForOption = true;
          votedOptionIndex = i;
          break;
        }
      }

      setHasVoted(userVotedForOption);
      setSelectedPollOption(votedOptionIndex);
    } else if (poll) {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
      const results = poll.options.map(option => ({
        ...option,
        percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
      }));
      setPollResults(results);
      setHasVoted(false);
      setSelectedPollOption(null);
    } else {
      setPollResults([]);
      setHasVoted(false);
      setSelectedPollOption(null);
    }
  }, [poll, user]);

  const handleLike = async () => {
    if (!user) {
      showNotification('Please log in to like posts', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      setIsLiked(!isLiked);
      onLike?.();
      showNotification(isLiked ? 'Лайк убран' : 'Лайк добавлен', 'success');
    } catch (err) {
      showNotification('Failed to like post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetweet = async () => {
    if (!user) {
      showNotification('Пожалуйста, войдите в систему', 'error');
      return;
    }

    if (isRetweeted) {
      showNotification('Публикация уже репостнута', 'info');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/retweet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to repost');
      }

      setIsRetweeted(true);
      showNotification('Публикация успешно репостнута', 'success');
      onRetweet?.();
    } catch (error) {
      showNotification('Ошибка при репосте публикации', 'error');
    }
  };

  const handleComment = () => {
    setIsCommentModalOpen(true);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommentSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: commentText }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      
      setCommentText('');
      
      const commentsRes = await fetch(`${API_URL}/api/posts/${id}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const commentsData = await commentsRes.json();
      setComments(commentsData);
      
      onComment?.();
      
      setIsCommentModalOpen(false);
      showNotification('Комментарий успешно добавлен', 'success');
    } catch (error) {
      showNotification('Ошибка при добавлении комментария', 'error');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      showNotification('Пожалуйста, войдите в систему', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/posts/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to like comment');
      
      const data = await response.json();
      setComments((prev) => prev.map((c) => 
        c.id === commentId 
          ? { ...c, likesCount: data.likesCount, isLiked: !c.isLiked } 
          : c
      ));
      
      showNotification(data.message || 'Лайк обновлен', 'success');
    } catch (error) {
      showNotification('Ошибка при лайке комментария', 'error');
    }
  };

  const handleDelete = async () => {
    if (!user) {
      showNotification('Пожалуйста, войдите в систему', 'error');
      return;
    }

    if (user.id !== author.id) {
      showNotification('Вы можете удалять только свои публикации', 'error');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить эту публикацию?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      showNotification('Публикация успешно удалена', 'success');
      onDelete?.();
    } catch (error) {
      showNotification('Ошибка при удалении публикации', 'error');
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!user) {
      showNotification('Please log in to vote', 'error');
      return;
    }

    const hasVotedCheck = pollResults.some(option => option.voterIds?.includes(user.id));

    if (hasVotedCheck) {
      showNotification('You have already voted.', 'info');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/poll/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ optionIndex }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to vote');
      }

      const data = await response.json();
      
      if (data.poll) {
        let votedOptionIndex: number | null = null;
        for (let i = 0; i < data.poll.options.length; i++) {
          const option = data.poll.options[i];
          if (option.voterIds?.includes(user.id)) {
            votedOptionIndex = i;
            break;
          }
        }
        setHasVoted(votedOptionIndex !== null);
        setSelectedPollOption(votedOptionIndex);
        
        const totalVotes = data.poll.options.reduce((sum: number, option: { votes: number }) => sum + option.votes, 0);
        const updatedOptions = data.poll.options.map((option: { text: string; votes: number; voterIds?: string[] }) => ({
          ...option,
          percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
        }));
        setPollResults(updatedOptions);
      }

      showNotification(data.message, 'success');
    } catch (error) {
      console.error('Vote error:', error);
      showNotification((error as Error).message, 'error');
    }
  };

  const handleCancelVote = async () => {
    if (!user) {
      showNotification('Please log in to cancel vote', 'error');
      return;
    }

    const hasVotedCheck = pollResults.some(option => option.voterIds?.includes(user.id));
    
    if (!hasVotedCheck) {
      showNotification('You have not voted in this poll.', 'info');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/poll/cancel-vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel vote');
      }

      const data = await response.json();
      
      if (data.poll) {
        const hasVotedAfterCancel = data.poll.options.some((option: { voterIds?: string[] }) => option.voterIds?.includes(user.id));
        setHasVoted(hasVotedAfterCancel);
        setSelectedPollOption(null);

        const totalVotes = data.poll.options.reduce((sum: number, option: { votes: number }) => sum + option.votes, 0);
        const updatedOptions = data.poll.options.map((option: { text: string; votes: number; voterIds?: string[] }) => ({
          ...option,
          percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
        }));
        setPollResults(updatedOptions);
      }

      showNotification(data.message, 'success');
    } catch (error) {
      console.error('Cancel vote error:', error);
      showNotification((error as Error).message, 'error');
    }
  };

  const renderMedia = (mediaItem: { path: string; type: string } | string, index: number) => {
    const [imgError, setImgError] = useState(false);
    const mediaPath = typeof mediaItem === 'string' ? mediaItem : mediaItem.path;
    const mediaType = typeof mediaItem === 'string' ? 'file' : mediaItem.type;
    
    const ext = mediaPath.split('.').pop()?.toLowerCase() || '';
    const isImage = mediaType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(ext);
    const isPdf = ext === 'pdf';
    const isDoc = ['doc', 'docx'].includes(ext);
    const isExcel = ['xls', 'xlsx'].includes(ext);
    const fileName = mediaPath.split('/').pop() || mediaPath;

    const handleDownload = () => {
      const downloadUrl = `${API_URL}/api/posts/download/${fileName}`;
      window.open(downloadUrl, '_blank');
    };

    if (isImage) {
      const imageUrl = `${API_URL}${mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`}`;
      return (
        <div key={index} className={styles.mediaItem}>
          {!imgError ? (
            <img
              src={imageUrl}
              alt={`Media ${index + 1}`}
              style={{ cursor: 'pointer' }}
              onClick={handleDownload}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.placeholder}>
              <ImageIcon style={{ fontSize: 48, color: '#555' }} />
              <span className={styles.fileName} style={{ color: '#aaa', marginTop: 8 }}>{fileName}</span>
            </div>
          )}
          <button onClick={handleDownload} className={styles.downloadButton}>
            <DownloadIcon />
          </button>
        </div>
      );
    } else if (isPdf || isDoc || isExcel) {
      let Icon = FileIcon;
      if (isPdf) Icon = PdfIcon;
      else if (isDoc) Icon = DocIcon;
      else if (isExcel) Icon = ExcelIcon;
      return (
        <div key={index} className={styles.filePreview}>
          <div className={styles.fileIcon}>
            <Icon />
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
              <h4 className={styles.pollQuestion} style={{ color: 'white' }}>{poll.question}</h4>
              <ul className={styles.pollOptions}>
                {pollResults.map((option, index) => (
                  <li key={index} className={styles.pollOption}>
                    <button
                      className={`${styles.pollOptionButton} ${
                        selectedPollOption === index ? styles.selected : ''
                      }`}
                      onClick={() => handleVote(index)}
                      disabled={hasVoted && selectedPollOption !== null}
                    >
                      <div className={styles.pollOptionContent}>
                        <span className={styles.pollOptionText}>{option.text}</span>
                        {hasVoted && (
                          <span className={styles.pollPercentage}>
                            {option.percentage}%
                          </span>
                        )}
                      </div>
                      {hasVoted && (
                        <div 
                          className={styles.pollProgressBar}
                          style={{ width: `${option.percentage}%` }}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {hasVoted && selectedPollOption !== null && (
                <div className={styles.pollActions}>
                  <div className={styles.pollVotesCount}>
                    Всего голосов: {pollResults.reduce((sum, option) => sum + option.votes, 0)}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCancelVote}
                    style={{ color: '#f44336' }}
                  >
                    Отменить голос
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className={styles.postActions}>
            <button
              className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <ThumbUpIcon />
              <span>{likes.length}</span>
            </button>
            <button className={styles.actionButton} onClick={handleComment}>
              <CommentIcon />
              <span>{commentsCount}</span>
            </button>
            <button
              className={`${styles.actionButton} ${isRetweeted ? styles.retweeted : ''}`}
              onClick={handleRetweet}
            >
              <RetweetIcon />
              <span>{retweetsCount}</span>
            </button>
            <button className={styles.actionButton}>
              <ShareIcon />
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
          {comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <Link to={`/profile/${comment.author.id}`} className={styles.commentAuthor}>
                  {comment.author.nickname}
                </Link>
                <span className={styles.commentTime}>
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
                </span>
              </div>
              <div className={styles.commentContent}>{comment.content}</div>
              <div className={styles.commentActions}>
                <button
                  className={`${styles.actionButton} ${comment.isLiked ? styles.liked : ''}`}
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <ThumbUpIcon />
                  <span>{comment.likesCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Написать комментарий..."
            disabled={isCommentSubmitting}
          />
          <Button type="submit" disabled={isCommentSubmitting || !commentText.trim()}>
            Отправить
          </Button>
        </form>
      </Modal>
    </article>
  );
};

export default Post; 