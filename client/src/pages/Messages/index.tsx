import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, List, ListItem, Avatar, TextField, IconButton, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config';
import { formatDistanceToNowStrict } from 'date-fns';
import { ru } from 'date-fns/locale';
import SendIcon from '@mui/icons-material/Send';
import PageLayout from '../../components/PageLayout';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    nickname: string;
    avatar?: string;
  };
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
}

const Messages = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isLoadingConversations, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/conversations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const { isLoading: isLoadingMessages, error: messagesError } = useQuery<Message[]>({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      try {
        const response = await fetch(`${API_URL}/api/conversations/${selectedConversation}/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    },
    enabled: !!selectedConversation,
    retry: 1,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) throw new Error('No conversation selected');
      const response = await fetch(`${API_URL}/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedConversation) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!currentUser || !userId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showNotification('Ошибка загрузки сообщений', 'error');
    }
  }, [currentUser, userId, showNotification]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoadingConversations) {
    return (
      <PageLayout title="Сообщения">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (conversationsError) {
    return (
      <PageLayout title="Сообщения">
        <Box sx={{ p: 2 }}>
          <Typography color="error" align="center">
            Ошибка загрузки диалогов. Пожалуйста, попробуйте позже.
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Сообщения">
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Conversations List */}
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <List>
            {conversations?.map((conversation) => (
              <ListItem
                key={conversation.id}
                button
                selected={selectedConversation === conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar
                    src={conversation.participant.avatar ? `${API_URL}${conversation.participant.avatar}` : undefined}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap>
                      {conversation.participant.nickname}
                    </Typography>
                    {conversation.lastMessage && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {conversation.lastMessage.content}
                      </Typography>
                    )}
                  </Box>
                  {conversation.unreadCount > 0 && (
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: '50%',
                        minWidth: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        ml: 1,
                      }}
                    >
                      {conversation.unreadCount}
                    </Box>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {isLoadingMessages ? (
                <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                  <CircularProgress />
                </Box>
              ) : messagesError ? (
                <Box sx={{ p: 2 }}>
                  <Typography color="error" align="center">
                    Ошибка загрузки сообщений. Пожалуйста, попробуйте позже.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {messages?.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.sender.id === localStorage.getItem('userId') ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            bgcolor: msg.sender.id === localStorage.getItem('userId') ? 'primary.main' : 'grey.100',
                            color: msg.sender.id === localStorage.getItem('userId') ? 'primary.contrastText' : 'text.primary',
                            p: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body1">{msg.content}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {formatDistanceToNowStrict(new Date(msg.createdAt), {
                              addSuffix: true,
                              locale: ru,
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>
                  <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Введите сообщение..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                    />
                    <IconButton
                      color="primary"
                      type="submit"
                      disabled={!message.trim() || sendMessageMutation.isPending}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
              sx={{ color: 'text.secondary' }}
            >
              <Typography variant="h6">Выберите диалог для начала общения</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </PageLayout>
  );
};

export default Messages; 