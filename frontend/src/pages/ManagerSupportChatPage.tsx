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
  IconButton,
} from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supportService } from '../services/supportService';
import { websocketService } from '../services/websocketService';
import { SupportMessage } from '../types/support';
import { useParams, useNavigate } from 'react-router-dom';

const ManagerSupportChatPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requestId) {
      loadMessages();
      const token = localStorage.getItem('access_token');
      if (token) {
        websocketService.connect(token);
        websocketService.subscribeToChat(requestId);
      }

      websocketService.on('newMessage', handleNewMessage);
      return () => {
        websocketService.off('newMessage', handleNewMessage);
      };
    }
  }, [requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && user && requestId) {
      const hasUnreadMessages = messages.some(
        msg => msg.author.id !== user.id && !msg.readAt
      );
      if (hasUnreadMessages) {
        markMessagesAsRead();
      }
    }
  }, [messages, user, requestId]);

  const loadMessages = async () => {
    if (!requestId) return;

    try {
      setIsLoading(true);
      const messagesData = await supportService.getSupportRequestMessages(requestId);
      setMessages(messagesData);

      if (messagesData.length > 0) {
        const clientMessage = messagesData.find(msg => msg.author.id !== user?.id);
        if (clientMessage) {
          setClientInfo(clientMessage.author);
        }
      }
    } catch (err: any) {
      setError('Ошибка загрузки сообщений');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupportRequests = async () => {
    try {
      const requests = await supportService.getManagerSupportRequests({ isActive: true });
      console.log('Список обращений обновлен');
    } catch (err: any) {
      console.error('Ошибка загрузки обращений:', err);
    }
  };

  const markMessagesAsRead = async () => {
    if (!requestId || !user) return;

    try {
      const now = new Date().toISOString();
      await supportService.markMessagesAsRead(requestId, {
        createdBefore: now
      });

      await loadSupportRequests();
    } catch (err) {
      console.error('Ошибка отметки сообщений прочитанными:', err);
    }
  };

  const handleNewMessage = (message: SupportMessage) => {
    setMessages(prev => [...prev, message]);

    if (message.author.id !== user?.id) {
      markMessagesAsRead();
    }
  };

  const handleSendMessage = async () => {
    if (!requestId || !newMessage.trim()) return;

    try {
      const message = await supportService.sendMessage(requestId, { text: newMessage });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setError(null);
    } catch (err: any) {
      setError('Ошибка отправки сообщения');
    }
  };

  const handleCloseRequest = async () => {
    if (!requestId) return;

    try {
      await supportService.closeSupportRequest(requestId);
      navigate('/manager/support');
    } catch (err: any) {
      setError('Ошибка закрытия обращения');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/manager/support')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0, flex: 1 }}>
          Чат поддержки
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CloseIcon />}
          onClick={handleCloseRequest}
        >
          Закрыть обращение
        </Button>
      </Box>

      {clientInfo && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Клиент: {clientInfo.name}</Typography>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
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
      </Paper>
    </Box>
  );
};

export default ManagerSupportChatPage;