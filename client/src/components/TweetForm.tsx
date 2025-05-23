import { Box, TextField, Button, Avatar, IconButton } from '@mui/material'
import {
  Image as ImageIcon,
  GifBox as GifIcon,
  Poll as PollIcon,
  SentimentSatisfiedAlt as EmojiIcon,
  Event as EventIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

interface TweetFormProps {
  newPost: string
  setNewPost: (v: string) => void
  selectedImage: File | null
  setSelectedImage: (f: File | null) => void
  isPending: boolean
  handleSubmit: (e: React.FormEvent) => void
}

const TweetForm = ({
  newPost,
  setNewPost,
  selectedImage,
  setSelectedImage,
  isPending,
  handleSubmit,
}: TweetFormProps) => (
  <div style={{ display: 'flex', padding: '12px 16px 8px 16px', borderBottom: '1px solid #222', background: '#15202b' }}>
    <Avatar src="/avatar.png" sx={{ width: 48, height: 48, mr: 2 }} />
    <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TextField
        multiline
        minRows={1}
        maxRows={6}
        placeholder="Что происходит?"
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        fullWidth
        variant="standard"
        InputProps={{
          disableUnderline: true,
          style: { color: '#fff', fontSize: 20, background: 'transparent', padding: 0 },
        }}
        sx={{ mb: selectedImage ? 1 : 2, '& textarea': { background: 'transparent', padding: 0 } }}
      />
      {selectedImage && (
        <Box sx={{ mb: 1, position: 'relative', width: 120 }}>
          <img src={URL.createObjectURL(selectedImage)} alt="preview" style={{ maxWidth: 120, borderRadius: 8 }} />
          <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, background: '#222', color: '#fff' }} onClick={() => setSelectedImage(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            sx={{ color: '#1da1f2', transition: 'background 0.2s', '&:hover': { background: '#223', color: '#1da1f2' } }}
            component="label"
          >
            <ImageIcon />
            <input
              type="file"
              hidden
              onChange={e => {
                if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0])
              }}
              disabled={isPending}
            />
          </IconButton>
          <IconButton size="small" sx={{ color: '#1da1f2', transition: 'background 0.2s', '&:hover': { background: '#223', color: '#1da1f2' } }}><GifIcon /></IconButton>
          <IconButton size="small" sx={{ color: '#1da1f2', transition: 'background 0.2s', '&:hover': { background: '#223', color: '#1da1f2' } }}><PollIcon /></IconButton>
          <IconButton size="small" sx={{ color: '#1da1f2', transition: 'background 0.2s', '&:hover': { background: '#223', color: '#1da1f2' } }}><EmojiIcon /></IconButton>
          <IconButton size="small" sx={{ color: '#1da1f2', transition: 'background 0.2s', '&:hover': { background: '#223', color: '#1da1f2' } }}><EventIcon /></IconButton>
        </Box>
        <Button
          variant="contained"
          type="submit"
          disabled={!newPost.trim() && !selectedImage}
          sx={{
            background: '#1da1f2',
            borderRadius: 9999,
            fontWeight: 'bold',
            textTransform: 'none',
            px: 3,
            boxShadow: 'none',
            opacity: (!newPost.trim() && !selectedImage) ? 0.6 : 1,
            transition: 'background 0.2s, opacity 0.2s',
            '&:hover': { background: '#1a8cd8' },
          }}
        >
          Tweet
        </Button>
      </Box>
    </form>
  </div>
)

export default TweetForm 