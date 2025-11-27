import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  MeetingRoom,
  ArrowBack,
  Hotel,
  Visibility,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hotelService } from '../services/hotelService';
import { Hotel as HotelType, HotelRoom } from '../types/hotel';

const HotelsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [hotelRooms, setHotelRooms] = useState<{ [hotelId: string]: HotelRoom[] }>({});
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roomsDialogOpen, setRoomsDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    currentPage: 1,
    hasMore: true
  });

  useEffect(() => {
    fetchHotels();
  }, [pagination.offset]);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const hotelsData = await hotelService.getHotels({
        limit: pagination.limit,
        offset: pagination.offset
      });

      setHotels(hotelsData);

      const hasMore = hotelsData.length === pagination.limit;

      setPagination(prev => ({
        ...prev,
        hasMore
      }));

    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке отелей');
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelRooms = async (hotelId: string) => {
    setRoomsLoading(hotelId);
    try {
      const rooms = await hotelService.searchRooms({
        limit: 50,
        offset: 0,
        hotel: hotelId,
      });
      setHotelRooms(prev => ({
        ...prev,
        [hotelId]: rooms
      }));
    } catch (err: any) {
      setError('Ошибка при загрузке номеров отеля');
      console.error('Error fetching hotel rooms:', err);
    } finally {
      setRoomsLoading(null);
    }
  };

  const handleEditHotel = (hotel: HotelType) => {
    setSelectedHotel(hotel);
    setEditDialogOpen(true);
  };

  const handleViewRooms = (hotel: HotelType) => {
    setSelectedHotel(hotel);
    if (!hotelRooms[hotel.id]) {
      fetchHotelRooms(hotel.id);
    }
    setRoomsDialogOpen(true);
  };

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel) return;

    setEditLoading(true);
    try {
      await hotelService.updateHotel(selectedHotel.id, {
        title: selectedHotel.title,
        description: selectedHotel.description || '',
      });

      setEditDialogOpen(false);
      setSelectedHotel(null);
      fetchHotels();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при обновлении отеля');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddHotelRoom = (hotelId: string) => {
    navigate(`/admin/add-hotel-room/${hotelId}`);
  };

  const handleEditHotelRoom = (roomId: string) => {
    navigate(`/admin/edit-hotel-room/${roomId}`);
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/uploads/${imagePath}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const maxPages = pagination.hasMore ? pagination.currentPage + 1 : pagination.currentPage;

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          У вас нет доступа к этой странице
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Главная
        </Link>
        <Typography color="text.primary">Управление отелями</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Управление отелями
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/add-hotel')}
          >
            Добавить отель
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {hotels.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Загружено отелей: {hotels.length}
          </Typography>
          {maxPages > 1 && (
            <Typography variant="body2" color="text.secondary">
              Страница {pagination.currentPage}
            </Typography>
          )}
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" sx={{ my: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : hotels.length === 0 ? (
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Hotel sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Отели не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Добавьте первый отель в систему
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/add-hotel')}
          >
            Добавить отель
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell>Дата обновления</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {hotel.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {hotel.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {hotel.description || 'Описание отсутствует'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(hotel.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(hotel.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditHotel(hotel)}
                          title="Редактировать отель"
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="info"
                          onClick={() => handleViewRooms(hotel)}
                          title="Просмотреть номера"
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleAddHotelRoom(hotel.id)}
                          title="Добавить номер"
                          size="small"
                        >
                          <MeetingRoom />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
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
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Редактировать отель</DialogTitle>
        <form onSubmit={handleUpdateHotel}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Название отеля"
                  value={selectedHotel?.title || ''}
                  onChange={(e) => setSelectedHotel(prev =>
                    prev ? { ...prev, title: e.target.value } : null
                  )}
                  disabled={editLoading}
                  helperText="Минимум 5 символов"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Описание отеля"
                  value={selectedHotel?.description || ''}
                  onChange={(e) => setSelectedHotel(prev =>
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                  disabled={editLoading}
                  helperText="Минимум 100 символов"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={editLoading ||
                !selectedHotel?.title ||
                !selectedHotel?.description ||
                selectedHotel.title.length < 5 ||
                selectedHotel.description.length < 100
              }
              startIcon={editLoading ? <CircularProgress size={20} /> : null}
            >
              {editLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={roomsDialogOpen}
        onClose={() => setRoomsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        maxHeight="80vh"
      >
        <DialogTitle>
          Номера отеля: {selectedHotel?.title}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setRoomsDialogOpen(false);
              handleAddHotelRoom(selectedHotel!.id);
            }}
            sx={{ ml: 2 }}
            size="small"
          >
            Добавить номер
          </Button>
        </DialogTitle>
        <DialogContent>
          {roomsLoading === selectedHotel?.id ? (
            <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
              <CircularProgress />
            </Box>
          ) : hotelRooms[selectedHotel?.id || '']?.length === 0 ? (
            <Box textAlign="center" sx={{ py: 4 }}>
              <MeetingRoom sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Номера не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Добавьте первый номер в этот отель
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {hotelRooms[selectedHotel?.id || '']?.map((room) => (
                <Grid item xs={12} md={6} key={room.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" component="h3">
                          Номер #{room.id.substring(0, 8)}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {room.description || 'Описание отсутствует'}
                      </Typography>

                      {room.images.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Фотографии: {room.images.length} шт.
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="caption" color="text.secondary" display="block">
                        Создан: {formatDate(room.createdAt)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditHotelRoom(room.id)}
                      >
                        Редактировать
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HotelsManagementPage;