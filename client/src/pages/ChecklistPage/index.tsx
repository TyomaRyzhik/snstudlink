import { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Checkbox, IconButton } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';

interface TodoItem {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
}

const ChecklistPage = () => {
  const { t } = useTranslation();
  // Временные данные для демонстрации списка дел
  const [todoItems, setTodoItems] = useState<TodoItem[]>([
    { id: '1', text: 'Повторная предзащита', dueDate: '27.05.2025', completed: true },
    { id: '2', text: 'Блок "Учёба" ', dueDate: '27.05.2025', completed: false },
    { id: '3', text: 'Видеоконференции', dueDate: '27.05.2025', completed: true },
    { id: '4', text: 'Миграция в Supabase', dueDate: '01.06.2025', completed: false },
  ]);

  // Обработчики для демонстрации
  const handleToggleComplete = (id: string) => {
    setTodoItems(todoItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setTodoItems(todoItems.filter(item => item.id !== id));
  };

  const handleAddTodo = () => {
    // Временная логика для добавления нового дела (заглушка)
    const newItem: TodoItem = {
      id: Date.now().toString(), // Простой уникальный ID
      text: 'Новое дело', // Заглушка текста
      dueDate: 'Дата не указана', // Заглушка даты
      completed: false,
    };
    setTodoItems([...todoItems, newItem]);
  };

  return (
    <PageLayout title={t('Чек-лист')}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('Чек-лист')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <Typography variant="h6">{t('Ваши дела на сегодня')}</Typography>
           <Button variant="contained" startIcon={<>+</>} onClick={handleAddTodo}>
             {t('Добавить дело')}
           </Button>
        </Box>

        <List>
          {todoItems.map(item => (
            <ListItem key={item.id} disablePadding secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)}>
                <DeleteIcon sx={{ color: 'white' }} />
              </IconButton>
            }>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={item.completed}
                  tabIndex={-1}
                  disableRipple
                  onChange={() => handleToggleComplete(item.id)}
                  sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ color: item.completed ? '#8899a6' : 'white', textDecoration: item.completed ? 'line-through' : 'none' }}>{item.text}</Typography>}
                secondary={<Typography variant="body2" color="text.secondary" sx={{ color: '#8899a6' }}>{t('Срок')}: {item.dueDate}</Typography>}
              />
            </ListItem>
          ))}
        </List>

      </Box>
    </PageLayout>
  );
};

export default ChecklistPage; 