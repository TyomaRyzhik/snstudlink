import { useState, useEffect } from 'react'
import { Box, Button, TextField, Typography, Paper } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams, useNavigate } from 'react-router-dom'

const typewriterPhrases = [
  'Добро пожаловать в StudLink!',
  'Общайся, делись, учись!',
  'Присоединяйся к студенческому сообществу!',
  'Создавай посты и находи друзей!',
  'Стань частью нашего сообщества!'
]

const TypewriterAnimatedText = () => {
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [blink, setBlink] = useState(true)
  const typingSpeed = isDeleting ? 30 : 80
  const pauseTime = 1200

  useEffect(() => {
    let timeout: number
    if (!isDeleting && charIndex < typewriterPhrases[phraseIndex].length) {
      timeout = setTimeout(() => {
        setText(typewriterPhrases[phraseIndex].slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, typingSpeed)
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setText(typewriterPhrases[phraseIndex].slice(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      }, typingSpeed)
    } else if (!isDeleting && charIndex === typewriterPhrases[phraseIndex].length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && charIndex === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setPhraseIndex((phraseIndex + 1) % typewriterPhrases.length)
      }, 400)
    }
    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex])

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlink(b => !b), 500)
    return () => clearInterval(blinkInterval)
  }, [])

  return (
    <span style={{
      display: 'inline-block',
      fontSize: 24,
      fontWeight: 700,
      color: '#5956e9',
      letterSpacing: 1,
      minHeight: 32,
      fontFamily: 'monospace',
      textAlign: 'center',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      whiteSpace: 'normal',
      marginBottom: 8,
      lineHeight: 1.3,
      width: '100%',
      maxWidth: 340,
    }}>
      {text}
      <span style={{
        display: 'inline-block',
        width: 12,
        color: '#5956e9',
        opacity: blink ? 1 : 0.2,
        transition: 'opacity 0.2s',
      }}>|</span>
    </span>
  )
}

const Auth = () => {
  const { login, register, user, loading } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    nickname: '',
    group: '',
  })
  const [firstLetter, setFirstLetter] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const isLogin = mode === 'login'

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'email' && e.target.value.length > 0) {
      setFirstLetter(e.target.value[0])
    } else if (e.target.name === 'email') {
      setFirstLetter('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form.username, form.nickname, form.email, form.password)
      }
    } catch (error) {
      // Error handling is done in the auth context
    }
  }

  // Позволяет менять режим через query-параметр
  const switchToRegister = () => setSearchParams({ mode: 'register' })
  const switchToLogin = () => setSearchParams({ mode: 'login' })

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      '@media (max-width:900px)': {
        flexDirection: 'column',
      },
    }}>
      {/* Левая часть */}
      <Box sx={{
        flex: 1,
        bgcolor: '#5956e9',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '@media (max-width:900px)': {
          display: 'none',
        },
      }}>
        <Typography variant="h2" sx={{ fontWeight: 700, fontSize: 80, mb: 2 }}>
          {'<'}/SL{'>'}
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9 }}>StudLink</Typography>
      </Box>
      {/* Правая часть */}
      <Box sx={{
        flex: 1,
        bgcolor: '#fafbfc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        '@media (max-width:900px)': {
          minHeight: 'auto',
          padding: '32px 0',
        },
      }}>
        <Paper elevation={0} sx={{
          width: 400,
          p: 4,
          bgcolor: 'transparent',
          boxShadow: 'none',
          textAlign: 'center',
          '@media (max-width:600px)': {
            width: '100%',
            minWidth: 0,
            p: 2,
          },
        }}>
          <Box sx={{ mb: 4, minHeight: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: '90%',
              maxWidth: 340,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              lineHeight: 1.3,
              minHeight: 32,
            }}>
              <TypewriterAnimatedText />
            </div>
          </Box>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <TextField
                  label="Имя пользователя"
                  name="username"
                  value={form.username}
                  onChange={handleInput}
                  fullWidth
                  sx={{ mb: 2, fontSize: { xs: 14, sm: 16 } }}
                />
                <TextField
                  label="Никнейм"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleInput}
                  fullWidth
                  sx={{ mb: 2, fontSize: { xs: 14, sm: 16 } }}
                />
                <TextField
                  label="Класс/группа"
                  name="group"
                  value={form.group}
                  onChange={handleInput}
                  fullWidth
                  sx={{ mb: 2, fontSize: { xs: 14, sm: 16 } }}
                />
              </>
            )}
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleInput}
              fullWidth
              sx={{ mb: 2, fontSize: { xs: 14, sm: 16 } }}
            />
            <TextField
              label="Пароль"
              name="password"
              type="password"
              value={form.password}
              onChange={handleInput}
              fullWidth
              sx={{ mb: 2, fontSize: { xs: 14, sm: 16 } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#5956e9',
                '&:hover': {
                  bgcolor: '#4a47d8',
                },
                fontSize: { xs: 15, sm: 17 },
                py: { xs: 1.2, sm: 1.5 },
              }}
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </form>
          <Typography sx={{ mt: 3, fontSize: 15 }}>
            {isLogin ? (
              <>
                Нет аккаунта?{' '}
                <span
                  style={{ color: '#5956e9', cursor: 'pointer', fontWeight: 500 }}
                  role="button"
                  tabIndex={0}
                  onClick={switchToRegister}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { switchToRegister(); } }}
                >
                  Зарегистрируйтесь
                </span>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <span
                  style={{ color: '#5956e9', cursor: 'pointer', fontWeight: 500 }}
                  role="button"
                  tabIndex={0}
                  onClick={switchToLogin}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { switchToLogin(); } }}
                >
                  Войти
                </span>
              </>
            )}
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default Auth 