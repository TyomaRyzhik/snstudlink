import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUserProfile } from '../../store/reducers/userSlice';
import { fetchUserTweets } from '../../store/reducers/tweetSlice';
import Tweet from '../../components/Tweet/Tweet';
import { Tweet as TweetType } from '../../types/tweet';
import styles from './Profile.module.css';
import { Button, Modal, TextField, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Profile: FC = () => {
  const { username } = useParams<{ username: string }>();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.user);
  const { tweets, loading: tweetsLoading } = useAppSelector((state) => state.tweet);
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === user?.id;

  // Диагностика:
  if (!currentUser) return <div>Нет currentUser</div>;
  if (!user) return <div>Нет user</div>;
  // Показываем значения для отладки
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ color: 'white', background: '#222', padding: 16 }}>
        <div>currentUser: {JSON.stringify(currentUser)}</div>
        <div>user: {JSON.stringify(user)}</div>
        <div>isOwner: {String(isOwner)}</div>
      </div>
    );
  }

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedBannerUrl, setEditedBannerUrl] = useState(user?.bannerUrl || '');
  const [editedAvatarUrl, setEditedAvatarUrl] = useState(user?.avatarUrl || '');
  const [editedBio, setEditedBio] = useState(user?.bio || '');

  useEffect(() => {
    if (username) {
      dispatch(fetchUserProfile(username));
      dispatch(fetchUserTweets(username));
    }
  }, [dispatch, username]);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    // Здесь можно добавить логику сохранения изменений, например, вызов API
    console.log('Saving profile changes:', { editedBannerUrl, editedAvatarUrl, editedBio });
    setIsEditModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <div className={styles.banner}>
          {user.bannerUrl && <img src={user.bannerUrl} alt="Banner" />}
        </div>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {user.avatarUrl && <img src={user.avatarUrl} alt="Avatar" />}
          </div>
          {isOwner && (
            <Button variant="contained" color="primary" className={styles.editButton} onClick={handleEditProfile}>
              Редактировать профиль
            </Button>
          )}
        </div>
      </div>
      <div className={styles.info}>
        <h1>{user.name}</h1>
        <p className={styles.username}>@{user.username}</p>
        <p className={styles.bio}>{user.bio}</p>
        <div className={styles.stats}>
          <span>{user.followingCount} Following</span>
          <span>{user.followersCount} Followers</span>
        </div>
      </div>
      <div className={styles.tweets}>
        <h2>Tweets</h2>
        {tweetsLoading ? (
          <div>Loading tweets...</div>
        ) : tweets.length > 0 ? (
          tweets.map((tweet: TweetType) => <Tweet key={tweet.id} tweet={tweet} />)
        ) : (
          <div>No tweets yet</div>
        )}
      </div>

      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <h2>Редактировать профиль</h2>
          <TextField
            fullWidth
            label="URL баннера"
            value={editedBannerUrl}
            onChange={(e) => setEditedBannerUrl(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="URL аватара"
            value={editedAvatarUrl}
            onChange={(e) => setEditedAvatarUrl(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Био"
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <Button variant="contained" color="primary" onClick={handleSaveProfile} sx={{ mt: 2 }}>
            Сохранить
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Profile; 