import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import { Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supportService } from '../services/supportService';
import { SupportRequest } from '../types/support';
import { useNavigate } from 'react-router-dom';

const SupportRequestsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    currentPage: 1,
    hasMore: true
  });

  useEffect(() => {
    loadSupportRequests();
  }, [pagination.offset]);

  const loadSupportRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await supportService.getManagerSupportRequests({
        isActive: true,
        limit: pagination.limit,
        offset: pagination.offset
      });
      setSupportRequests(requests);

      const hasMore = requests.length === pagination.limit;

      setPagination(prev => ({
        ...prev,
        hasMore
      }));
    } catch (err: any) {
      setError('Ошибка загрузки обращений');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseRequest = async () => {
    if (!selectedRequest) return;

    try {
      await supportService.closeSupportRequest(selectedRequest.id);
      setSupportRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? { ...req, isActive: false }
            : req
        )
      );
      setCloseDialogOpen(false);
      setSelectedRequest(null);
      setError(null);
    } catch (err: any) {
      setError('Ошибка закрытия обращения');
    }
  };

  const handleOpenChat = (request: SupportRequest) => {
    navigate(`/manager/support/chat/${request.id}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setPagination(prev => ({
      ...prev,
      offset: newOffset,
      currentPage: page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        Обращения в поддержку
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {supportRequests.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Загружено обращений: {supportRequests.length}
          </Typography>
          {maxPages > 1 && (
            <Typography variant="body2" color="text.secondary">
              Страница {pagination.currentPage}
            </Typography>
          )}
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата создания</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Новые сообщения</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supportRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>{request.client?.name}</TableCell>
                <TableCell>{request.client?.email}</TableCell>
                <TableCell>{request.client?.contactPhone || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={request.isActive ? 'Активно' : 'Закрыто'}
                    color={request.isActive ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {request.hasNewMessages && (
                    <Chip label="Есть новые" color="secondary" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleOpenChat(request)}
                    >
                      Открыть
                    </Button>
                    {request.isActive && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CloseIcon />}
                        onClick={() => {
                          setSelectedRequest(request);
                          setCloseDialogOpen(true);
                        }}
                      >
                        Закрыть
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {supportRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                    Нет активных обращений
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {maxPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={maxPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
      >
        <DialogTitle>Закрытие обращения</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите закрыть обращение от клиента {selectedRequest?.client?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleCloseRequest} color="error" variant="contained">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportRequestsPage;