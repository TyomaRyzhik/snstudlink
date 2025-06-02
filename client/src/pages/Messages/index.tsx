import PageLayout from '../../components/PageLayout'
import { Box, Typography, List, ListItem, ListItemText, Avatar, Divider, TextField, IconButton, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useState, useEffect, useRef } from 'react'
import { API_URL } from '../../config'
import { useTranslation } from 'react-i18next'

interface Participant {
  id: string
  nickname: string
  avatar: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: Participant
}

interface Conversation {
  id: string
  participants: Participant[]
  lastMessage: Message | null
  createdAt: string
  updatedAt: string
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref for message area to enable scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // TODO: Get actual current user ID
  const currentUserId = localStorage.getItem('userId') || '' // Replace with actual logic

  const { t } = useTranslation()

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true)
      setError(null)
      try {
        const response = await fetch(`${API_URL}/api/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (!response.ok) {
          throw new Error(`Error fetching conversations: ${response.statusText}`)
        }
        const data: Conversation[] = await response.json()
        setConversations(data)
      } catch (err: any) {
        console.error('Error fetching conversations:', err)
        setError(err.message)
      } finally {
        setLoadingConversations(false)
      }
    }

    fetchConversations()
  }, [])

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return

      setLoadingMessages(true)
      setError(null)
      try {
        const response = await fetch(`${API_URL}/api/messages/${selectedConversation.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (!response.ok) {
          throw new Error(`Error fetching messages: ${response.statusText}`)
        }
        const data: Message[] = await response.json()
        setMessages(data)
      } catch (err: any) {
        console.error('Error fetching messages:', err)
        setError(err.message)
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [selectedConversation]) // Refetch messages when selectedConversation changes

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    // Optimistically add message (optional but improves UX)
    const tempMessage: Message = {
        id: Date.now().toString(), // Temp ID
        content: newMessage,
        createdAt: new Date().toISOString(),
        sender: { // Placeholder for current user's info
            id: currentUserId, // Use actual user ID
            nickname: 'You', // TODO: Replace with actual nickname
            avatar: '', // TODO: Replace with actual avatar
        }
    };
    setMessages([...messages, tempMessage]);
    setNewMessage(''); // Clear input immediately

    try {
        const response = await fetch(`${API_URL}/api/messages/${selectedConversation.id}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ content: newMessage }),
        });

        if (!response.ok) {
            throw new Error(`Error sending message: ${response.statusText}`);
            // TODO: Handle error: maybe revert optimistic update or show error message
        }

        // Assuming server returns the saved message with correct ID and timestamp
        const sentMessage: Message = await response.json();
        // Replace temp message or just add if no optimistic update
        setMessages(messages.map(msg => msg.id === tempMessage.id ? sentMessage : msg));

    } catch (err: any) {
        console.error('Error sending message:', err);
        setError(err.message);
        // TODO: Show error to user
        setMessages(messages.filter(msg => msg.id !== tempMessage.id)); // Remove optimistic update on error
    }
  };

  // Helper to get conversation name (e.g., participants' nicknames)
  const getConversationName = (conversation: Conversation) => {
      // Exclude current user from participant list for display
      const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId); // Use actual user ID check
      if (otherParticipants.length === 0) return t('self_chat'); // Case with only one participant (shouldn't happen in typical messenger)
      if (otherParticipants.length === 1) return otherParticipants[0].nickname;
      return otherParticipants.map(p => p.nickname).join(', '); // For group chats
  };

    // Helper to get conversation avatar
    const getConversationAvatar = (conversation: Conversation) => {
        // For a direct message, show the other participant's avatar
        const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
        if (otherParticipant) return `${API_URL}${otherParticipant.avatar}`;
        
        // For a group chat, you might show a default group avatar or a combination
        return undefined; // Placeholder for group avatar
    };

  return (
    <PageLayout title={t('messages')}>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}> {/* Adjust height based on header */}

        {/* Conversations List (Sidebar) */}
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ p: 2 }}>{t('conversations')}</Typography>
          <Divider />
          {loadingConversations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
          ) : error ? (
              <Typography color="error" sx={{ mt: 2, px: 2 }}>{t('error_loading_conversations')} {error}</Typography>
          ) : conversations.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2, px: 2 }}>{t('no_conversations_yet')}</Typography>
          ) : (
            <List>
              {conversations.map(conversation => (
                <ListItem
                  button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  selected={selectedConversation?.id === conversation.id}
                >
                  <Avatar src={getConversationAvatar(conversation)} sx={{ mr: 2 }} /> {/* Use getConversationAvatar */}
                  <ListItemText
                    primary={getConversationName(conversation)}
                    secondary={conversation.lastMessage?.content || t('no_messages')}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Message Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{getConversationName(selectedConversation)}</Typography>
              </Box>

              {/* Messages Display */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {loadingMessages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{t('error_loading_messages')} {error}</Typography>
                ) : messages.length === 0 ? (
                    <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>{t('start_a_conversation')}</Typography>
                ) : (
                    messages.map(message => (
                      <Box key={message.id} sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: message.sender.id === currentUserId ? 'flex-end' : 'flex-start' }}> {/* Use actual user ID check, adjust alignment */}
                         {/* Display sender name if not current user */}
                        {message.sender.id !== currentUserId && (
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', mb: 0.5 }}>
                                {message.sender.nickname}
                            </Typography>
                        )}
                          <Box sx={{ bgcolor: message.sender.id === currentUserId ? 'primary.main' : 'grey.700', color: 'white', p: 1, borderRadius: 1, maxWidth: '80%' }}> {/* Use actual user ID check */}
                              <Typography variant="body2">{message.content}</Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.7)', display: 'block', textAlign: message.sender.id === currentUserId ? 'right' : 'left' }}> {/* Align time */}
                                  {new Date(message.createdAt).toLocaleTimeString()}
                              </Typography>
                          </Box>
                      </Box>
                    ))
                )}
                <div ref={messagesEndRef} /> {/* Element to scroll to */}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                  disabled={loadingMessages}
                />
                <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim() || loadingMessages}>
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : ( // No conversation selected
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" color="text.secondary">Выберите беседу</Typography>
            </Box>
          )}
        </Box>

      </Box>
    </PageLayout>
  )
}

export default Messages 