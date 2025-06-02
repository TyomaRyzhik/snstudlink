import { useState } from 'react'
import { Box, Typography, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel, Divider } from '@mui/material'
import PageLayout from '../../components/PageLayout'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

const More = () => {
  const { mode, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState(i18n.language) // Default language from i18n

  const handleLanguageChange = (event: any) => {
    const selectedLanguage = event.target.value as string
    setLanguage(selectedLanguage)
    i18n.changeLanguage(selectedLanguage)
  }

  return (
    <PageLayout title={t('settings')}>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('settings')}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('theme_settings')}
          </Typography>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
            label={mode === 'dark' ? t('dark_theme') : t('light_theme')}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('language')}
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">{t('language')}</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={language}
              label={t('language')}
              onChange={handleLanguageChange}
            >
              <MenuItem value="ru">Русский</MenuItem>
              <MenuItem value="en">English</MenuItem>
              {/* Add more languages as needed */}
            </Select>
          </FormControl>
        </Box>

        {/* Add more setting sections here */}

      </Box>
    </PageLayout>
  )
}

export default More 