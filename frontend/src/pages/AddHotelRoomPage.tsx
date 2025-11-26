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
} from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';
import ImageUpload from '../components/ImageUpload';

const AddHotelRoomPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState(hotelId || '');
  const [formData, setFormData] = useState({
    description: '',
    isEnabled: true,
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setHotelsLoading(true);
    try {
      const hotelsData = await hotelService.getHotels({ limit: 100, offset: 0 });
      setHotels(hotelsData);

      if (hotelId && hotelsData.find(h => h.id === hotelId)) {
        setSelectedHotelId(hotelId);
      }
    } catch (err: any) {
      setError('Ошибка при загрузке списка отелей');
    } finally {
      setHotelsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHotelId) {
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
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('hotelId', selectedHotelId);
      formDataToSend.append('isEnabled', formData.isEnabled.toString());

      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('http://localhost:3000/api/admin/hotel-rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании номера');
      }

      const result = await response.json();
      setSuccess(true);

      setTimeout(() => {
        navigate('/admin/hotels');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Ошибка при создании номера');
      console.error('Create hotel room error:', err);
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
    setSelectedHotelId(e.target.value);
  };

  const handleImagesChange = (newImages: File[]) => {
    setImages(newImages);
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Главная
        </Link>
        <Link component={RouterLink} to="/admin/hotels" color="inherit">
          Управление отелями
        </Link>
        <Typography color="text.primary">Добавить номер</Typography>
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
          Добавить номер отеля
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Номер успешно создан! Перенаправляем...
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
                value={selectedHotelId}
                onChange={handleHotelChange}
                disabled={loading || hotelsLoading}
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

            <Grid item xs={12}>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={10}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                  startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                  disabled={
                    loading ||
                    !selectedHotelId ||
                    !formData.description.trim() ||
                    formData.description.length < 10
                  }
                >
                  {loading ? 'Создание...' : 'Создать номер'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddHotelRoomPage;