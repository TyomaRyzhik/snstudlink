import PageLayout from '../../components/PageLayout'
import { Box, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Checkbox, IconButton, ListItemIcon } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru'; // Import Russian locale

interface ChecklistItem {
  id: string
  description: string
  isCompleted: boolean
  createdAt: string
  dueDate: string | null; // Add dueDate field
}

const Lists = () => {
  const { user } = useAuth(); // Get authenticated user
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [newItemDescription, setNewItemDescription] = useState('')
  const [selectedDueDate, setSelectedDueDate] = useState<Dayjs | null>(null); // State for due date
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChecklistItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/checklist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Error fetching checklist items: ${response.statusText}`)
      }
      const data: ChecklistItem[] = await response.json()
      setChecklistItems(data)
    } catch (err: any) {
      console.error('Error fetching checklist items:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) { // Fetch checklist items only if user is authenticated
      fetchChecklistItems();
    }
  }, [user]); // Depend on user

  const handleCreateItemClick = () => {
    setOpenCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false)
    setNewItemDescription('') // Clear input on close
    setSelectedDueDate(null); // Clear due date on close
  }

  const handleSaveNewItem = async () => {
    if (!newItemDescription.trim()) return

    setLoading(true) // Optionally show loading while creating
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          description: newItemDescription,
          dueDate: selectedDueDate ? selectedDueDate.toISOString() : null, // Include dueDate
        }),
      })

      if (!response.ok) {
        throw new Error(`Error creating checklist item: ${response.statusText}`)
      }

      // Refetch checklist items to include the new one
      fetchChecklistItems()

    } catch (err: any) {
      console.error('Error creating checklist item:', err)
      setError(err.message)
      setLoading(false); // Hide loading on error
    } finally {
      handleCloseCreateModal()
    }
  }

  const handleToggleComplete = async (item: ChecklistItem) => {
    // Optimistically update UI
    const updatedItems = checklistItems.map(i => 
      i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i
    );
    setChecklistItems(updatedItems);

    try {
      const response = await fetch(`${API_URL}/api/checklist/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isCompleted: !item.isCompleted }),
      });

      if (!response.ok) {
        // Revert UI if update fails
        fetchChecklistItems(); // Or revert specific item
        throw new Error(`Error updating checklist item: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Error updating checklist item:', err);
      setError(err.message);
      fetchChecklistItems(); // Revert UI on error
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    // Optimistically update UI
    const filteredItems = checklistItems.filter(item => item.id !== itemId);
    setChecklistItems(filteredItems);

    try {
      const response = await fetch(`${API_URL}/api/checklist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        // Revert UI if delete fails
        fetchChecklistItems(); // Or revert specific item
        throw new Error(`Error deleting checklist item: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Error deleting checklist item:', err);
      setError(err.message);
      fetchChecklistItems(); // Revert UI on error
    }
  };

  if (!user) { // Don't render if user is not authenticated
    return <Typography variant="h6" color="error" sx={{ textAlign: 'center', mt: 4 }}>
             Пожалуйста, войдите, чтобы просмотреть ваш список дел.
           </Typography>;
  }

  return (
    <PageLayout title="Список дел">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Ваши дела на сегодня
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateItemClick}
            disabled={loading}
          >
            Добавить дело
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            Ошибка: {error}
          </Typography>
        )}

        {!loading && !error && checklistItems.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            У вас пока нет дел в списке.
          </Typography>
        ) : (
          <List>
            {!loading && !error && checklistItems.map(item => (
              <ListItem 
                key={item.id} 
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon sx={{ color: 'white' }}/>
                  </IconButton>
                }
                sx={{ borderBottom: '1px solid #333', paddingY: 1 }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                   <Checkbox
                     edge="start"
                     checked={item.isCompleted}
                     tabIndex={-1}
                     disableRipple
                     onChange={() => handleToggleComplete(item)}
                   />
                </ListItemIcon>
                <ListItemText 
                  primary={item.description} 
                  secondary={item.dueDate ? `Срок: ${dayjs(item.dueDate).locale('ru').format('DD.MM.YYYY')}` : ''} // Display due date
                  primaryTypographyProps={{ sx: { textDecoration: item.isCompleted ? 'line-through' : 'none', color: 'white' } }}
                  secondaryTypographyProps={{ sx: { fontSize: '0.8rem', color: '#bbb' } }}
                />
              </ListItem>
            ))}
          </List>
        )}

      </Box>

      {/* Create Item Modal */}
      <Dialog open={openCreateModal} onClose={handleCloseCreateModal} fullWidth={true} maxWidth="sm">
        <DialogTitle>Добавить новое дело</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Описание дела"
            type="text"
            fullWidth
            variant="standard"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') { handleSaveNewItem(); } }}
          />
          <Box sx={{ mt: 2 }}>
             <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <DatePicker
                   label="Срок выполнения (необязательно)"
                   value={selectedDueDate}
                   onChange={(newValue) => setSelectedDueDate(newValue)}
                   format="DD.MM.YYYY"
                />
             </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal}>Отмена</Button>
          <Button onClick={handleSaveNewItem} disabled={!newItemDescription.trim()}>Добавить</Button>
        </DialogActions>
      </Dialog>

    </PageLayout>
  )
}

export default Lists 