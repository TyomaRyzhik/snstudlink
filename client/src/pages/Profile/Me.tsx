import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Profile.module.css'
import { Button, Modal, TextField, Box } from '@mui/material'

const ProfileMe = () => {
  const { user: currentUser } = useAuth()
  const user = currentUser
  const isOwner = true

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedBannerUrl, setEditedBannerUrl] = useState(user?.bannerUrl || '')
  const [editedAvatarUrl, setEditedAvatarUrl] = useState(user?.avatarUrl || '')
  const [editedBio, setEditedBio] = useState(user?.bio || '')

  if (!user) return <div>Загрузка...</div>

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
            <Button variant="contained" color="primary" className={styles.editButton} onClick={() => setIsEditModalOpen(true)}>
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
    </div>
  )
}

export default ProfileMe 