import { Snackbar, Alert } from '@mui/material'
import { useState } from 'react'

interface NotificationProps {
  message: string
  severity?: 'success' | 'error' | 'warning' | 'info'
  open: boolean
  onClose: () => void
}

export const Notification = ({
  message,
  severity = 'info',
  open,
  onClose,
}: NotificationProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
} 