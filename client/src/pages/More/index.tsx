import { useState } from 'react'
import { Box, Typography, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel, Divider } from '@mui/material'
import PageLayout from '../../components/PageLayout'

const More = () => {
  // Placeholder states for settings
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState('ru') // Default language

  // Placeholder handlers
  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsDarkMode(event.target.checked)
    // TODO: Implement theme change logic
    console.log('Dark mode:', event.target.checked)
  }

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value as string)
    // TODO: Implement localization change logic
    console.log('Language:', event.target.value)
  }

  return (
    <PageLayout title="Ещё">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Настройки
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Тема оформления
          </Typography>
          <FormControlLabel
            control={<Switch checked={isDarkMode} onChange={handleThemeChange} />}
            label={isDarkMode ? 'Темная тема' : 'Светлая тема'}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Язык
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">Язык</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={language}
              label="Язык"
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