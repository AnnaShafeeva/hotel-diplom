import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supportService } from '../services/supportService';
import { websocketService } from '../services/websocketService';
import { SupportRequest, SupportMessage, CreateSupportRequestData } from '../types/support';

const SupportChatPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    currentPage: 1,
    hasMore: true
  });

  const markMessagesAsRead = async () => {
    if (!selectedRequest || !user) return;

    try {
      const now = new Date().toISOString();
      await supportService.markMessagesAsRead(selectedRequest.id, {
        createdBefore: now
      });
      await loadSupportRequests();
    } catch (err) {
      console.error('Ошибка отметки сообщений прочитанными:', err);
    }
  };

  const handleNewMessage = (message: SupportMessage) => {
    if (selectedRequest) {
      setMessages(prev => [...prev, message]);

      if (message.author.id !== user?.id) {
        markMessagesAsRead();
      }
    }
  };

  useEffect(() => {
    loadSupportRequests();
    const token = localStorage.getItem('access_token');
    if (token) {
      websocketService.connect(token);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [pagination.offset]);

  useEffect(() => {
    if (selectedRequest) {
      loadMessages(selectedRequest.id);
      websocketService.subscribeToChat(selectedRequest.id);

      websocketService.on('newMessage', handleNewMessage);
      return () => {
        websocketService.off('newMessage', handleNewMessage);
      };
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (messages.length > 0 && user) {
      const hasUnreadMessages = messages.some(
        msg => msg.author.id !== user.id && !msg.readAt
      );
      if (hasUnreadMessages) {
        markMessagesAsRead();
      }
    }
  }, [messages, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSupportRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await supportService.getClientSupportRequests({
        limit: pagination.limit,
        offset: pagination.offset
      });
      setSupportRequests(requests);

      const hasMore = requests.length === pagination.limit;

      setPagination(prev => ({
        ...prev,
        hasMore
      }));

      if (requests.length > 0 && !selectedRequest) {
        setSelectedRequest(requests[0]);
      }
    } catch (err: any) {
      setError('Ошибка загрузки обращений');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (requestId: string) => {
    try {
      const messagesData = await supportService.getSupportRequestMessages(requestId);
      setMessages(messagesData);
    } catch (err: any) {
      setError('Ошибка загрузки сообщений');
    }
  };

  const handleCreateSupportRequest = async () => {
    if (newMessage.trim().length < 10) {
      setError('Текст обращения должен быть не менее 10 символов');
      return;
    }

    try {
      const data: CreateSupportRequestData = { text: newMessage };
      const request = await supportService.createSupportRequest(data);
      setSupportRequests(prev => [request, ...prev]);
      setSelectedRequest(request);
      setNewMessage('');
      setError(null);
      setPagination(prev => ({ ...prev, offset: 0, currentPage: 1 }));
    } catch (err: any) {
      setError('Ошибка создания обращения');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRequest || !newMessage.trim()) return;

    try {
      const message = await supportService.sendMessage(selectedRequest.id, { text: newMessage });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setError(null);
    } catch (err: any) {
      setError('Ошибка отправки сообщения');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setPagination(prev => ({
      ...prev,
      offset: newOffset,
      currentPage: page
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const maxPages = pagination.hasMore ? pagination.currentPage + 1 : pagination.currentPage;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Чат поддержки
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} sx={{ height: '600px' }}>
        <Paper sx={{ width: 300, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Мои обращения
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => {
              setSelectedRequest(null);
              setMessages([]);
            }}
          >
            Новое обращение
          </Button>

          <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            <List>
              {supportRequests.map((request) => (
                <ListItem
                  key={request.id}
                  button
                  selected={selectedRequest?.id === request.id}
                  onClick={() => setSelectedRequest(request)}
                  sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Typography variant="body2">
                      {formatDate(request.createdAt)}
                    </Typography>
                    <Chip
                      label={request.isActive ? 'Активно' : 'Закрыто'}
                      color={request.isActive ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                  {request.hasNewMessages && (
                    <Chip label="Новые" color="secondary" size="small" sx={{ mt: 0.5 }} />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>

          {maxPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={maxPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Paper>

        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedRequest ? (
            <>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  Обращение от {formatDate(selectedRequest.createdAt)}
                </Typography>
                <Chip
                  label={selectedRequest.isActive ? 'Активно' : 'Закрыто'}
                  color={selectedRequest.isActive ? 'primary' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <List>
                  {messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        flexDirection: 'column',
                        alignItems: message.author.id === user?.id ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: message.author.id === user?.id ? 'primary.light' : 'grey.100',
                          color: message.author.id === user?.id ? 'white' : 'text.primary',
                        }}
                      >
                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                          {message.author.name} • {formatDate(message.createdAt)}
                        </Typography>
                        <Typography variant="body1">{message.text}</Typography>
                      </Box>
                    </ListItem>
                  ))}
                  <div ref={messagesEndRef} />
                </List>
              </Box>

              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Отправить
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Создайте новое обращение
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Опишите вашу проблему, и мы постараемся помочь вам как можно скорее
              </Typography>
              <Box sx={{ mt: 2 }}>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  placeholder="Опишите вашу проблему (минимум 10 символов)..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleCreateSupportRequest}
                  disabled={newMessage.trim().length < 10}
                >
                  Создать обращение
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SupportChatPage;