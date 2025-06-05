import React from 'react'
import { useState, useRef } from 'react'
import { Box, IconButton, Typography, CircularProgress } from '@mui/material'
import { Image as ImageIcon } from '@mui/icons-material'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  disabled?: boolean
  initialImage?: string
}

export const ImageUpload = ({ onImageSelect, disabled = false, initialImage }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
      onImageSelect(file)
    } catch (err) {
      setError('Error processing image')
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <IconButton
        onClick={handleClick}
        disabled={disabled || isLoading}
        sx={{ color: 'primary.main' }}
      >
        {isLoading ? <CircularProgress size={24} /> : <ImageIcon />}
      </IconButton>
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
      {preview && (
        <Box
          component="img"
          src={preview}
          alt="Preview"
          sx={{
            maxWidth: '100%',
            maxHeight: 200,
            mt: 1,
            borderRadius: 1,
            objectFit: 'cover'
          }}
        />
      )}
    </Box>
  )
} 