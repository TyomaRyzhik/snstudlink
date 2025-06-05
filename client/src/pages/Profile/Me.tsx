import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Typography, CircularProgress } from '@mui/material'
import { getUserProfile } from '../../services/api'
import styles from './Me.module.css'
import { Button, Modal, TextField } from '@mui/material'

const Me = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => getUserProfile('me'),
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedBannerUrl, setEditedBannerUrl] = useState(user?.bannerUrl || '')
  const [editedAvatarUrl, setEditedAvatarUrl] = useState(user?.avatar || '')
  const [editedBio, setEditedBio] = useState(user?.bio || '')

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5">User not found</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <div className={styles.profileHeader}>
        {user.bannerUrl && <img src={user.bannerUrl} alt="Banner" />}
        <div className={styles.profileInfo}>
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.nickname}
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <h2>{user.nickname}</h2>
            <p className={styles.bio}>{user.bio}</p>
            <div className={styles.stats}>
              <span>{user.followingCount || 0} Following</span>
              <span>{user.followersCount || 0} Followers</span>
            </div>
          </div>
        </div>
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
          <Button variant="contained" color="primary" onClick={() => setIsEditModalOpen(false)} sx={{ mt: 2 }}>
            Сохранить
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}

export default Me 