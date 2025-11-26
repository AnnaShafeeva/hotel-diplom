import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { Save, ArrowBack, Delete, AddPhotoAlternate } from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hotelService } from '../services/hotelService';
import { Hotel, HotelRoom } from '../types/hotel';
import ImageUpload from '../components/ImageUpload';

const EditHotelRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [room, setRoom] = useState<HotelRoom | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    hotelId: '',
    isEnabled: true,
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomAndHotels();
    }
  }, [roomId]);

  const fetchRoomAndHotels = async () => {
    setRoomLoading(true);
    try {
      const hotelsData = await hotelService.getHotels({ limit: 100, offset: 0 });
      setHotels(hotelsData);

      if (roomId) {
        const roomData = await hotelService.getRoomById(roomId);
        setRoom(roomData);
        setFormData({
          description: roomData.description || '',
          hotelId: roomData.hotel.id,
          isEnabled: true,
        });
        setExistingImages(roomData.images || []);
      }
    } catch (err: any) {
      setError('Ошибка при загрузке данных');
      console.error('Error fetching data:', err);
    } finally {
      setRoomLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hotelId) {
      setError('Выберите отель');
      return;
    }

    if (!formData.description.trim()) {
      setError('Описание номера обязательно');
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('Описание номера должно содержать минимум 10 символов');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await hotelService.updateHotelRoom(roomId!, {
        description: formData.description.trim(),
        hotelId: formData.hotelId,
        isEnabled: formData.isEnabled,
        images: newImages,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/hotels');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении номера');
      console.error('Update hotel room error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hotelId: e.target.value }));
  };

  const handleNewImagesChange = (images: File[]) => {
    setNewImages(images);
  };

  const removeExistingImage = (imageToRemove: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageToRemove));
  };

  const handleDeleteRoom = async () => {
    try {
      await hotelService.deleteHotelRoom(roomId!);
      setDeleteDialogOpen(false);
      navigate('/admin/hotels');
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении номера');
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';

    if (imagePath.startsWith('http')) return imagePath;

    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:3000${imagePath}`;
    }

    if (imagePath.startsWith('uploads/')) {
      return `http://localhost:3000/${imagePath}`;
    }

    return `http://localhost:3000/uploads/${imagePath}`;
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          У вас нет доступа к этой странице
        </Alert>
      </Container>
    );
  }

  if (roomLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" sx={{ my: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Номер не найден
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/hotels')} sx={{ mt: 2 }}>
          Назад к управлению отелями
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Главная
        </Link>
        <Link component={RouterLink} to="/admin/hotels" color="inherit">
          Управление отелями
        </Link>
        <Typography color="text.primary">Редактирование номера</Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/hotels')}
        sx={{ mb: 3 }}
      >
        Назад
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Редактирование номера
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Номер успешно обновлен! Перенаправляем...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                label="Отель"
                name="hotelId"
                value={formData.hotelId}
                onChange={handleHotelChange}
                disabled={loading}
              >
                {hotels.map((hotel) => (
                  <MenuItem key={hotel.id} value={hotel.id}>
                    {hotel.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Описание номера"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Опишите особенности номера, удобства, вид из окна и т.д."
                error={formData.description.length > 0 && formData.description.length < 10}
                helperText={
                  formData.description.length > 0 && formData.description.length < 10
                    ? 'Минимум 10 символов'
                    : 'Опишите номер (минимум 10 символов)'
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isEnabled"
                    checked={formData.isEnabled}
                    onChange={handleChange}
                    disabled={loading}
                  />
                }
                label="Номер доступен для бронирования"
              />
            </Grid>

            {existingImages.length > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Существующие фотографии
                  </Typography>
                  <Grid container spacing={1}>
                    {existingImages.map((image, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="140"
                            image={getImageUrl(image)}
                            alt={`Фото номера ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                            onError={(e) => {
                              console.error('Image load error for:', image);
                              console.error('Full URL:', getImageUrl(image));
                            }}
                          />
                          <CardContent sx={{ py: 1, px: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Фото {index + 1}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removeExistingImage(image)}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Добавить новые фотографии
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Существующие фотографии сохранятся автоматически. Новые будут добавлены к ним.
              </Typography>
              <ImageUpload
                onImagesChange={handleNewImagesChange}
                maxImages={10 - existingImages.length}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={loading}
                >
                  Удалить номер
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/admin/hotels')}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={
                      loading ||
                      !formData.hotelId ||
                      !formData.description.trim() ||
                      formData.description.length < 10
                    }
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот номер? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteRoom} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditHotelRoomPage;