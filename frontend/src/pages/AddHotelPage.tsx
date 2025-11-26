import React, { useState } from 'react';
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
} from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hotelService } from '../services/hotelService';

const AddHotelPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (formData.title.length < 5) {
      setError('Название отеля должно содержать минимум 5 символов');
      return;
    }

    if (formData.description.length < 100) {
      setError('Описание отеля должно содержать минимум 100 символов');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await hotelService.createHotel({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      setSuccess(true);
      setFormData({ title: '', description: '' });

      setTimeout(() => {
        navigate('/admin/hotels');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании отеля');
      console.error('Create hotel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <Typography color="text.primary">Добавить отель</Typography>
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
          Добавить новый отель
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Отель успешно создан! Перенаправляем...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Название отеля"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                error={formData.title.length > 0 && formData.title.length < 5}
                helperText={
                  formData.title.length > 0 && formData.title.length < 5
                    ? 'Минимум 5 символов'
                    : 'Минимум 5 символов'
                }
                placeholder="Введите название отеля"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={6}
                label="Описание отеля"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                error={formData.description.length > 0 && formData.description.length < 100}
                helperText={
                  formData.description.length > 0 && formData.description.length < 100
                    ? `Минимум 100 символов (сейчас: ${formData.description.length})`
                    : `Минимум 100 символов (сейчас: ${formData.description.length})`
                }
                placeholder="Подробное описание отеля, удобств, расположения и т.д."
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
                  disabled={loading || !formData.title.trim() || !formData.description.trim() || formData.title.length < 5 || formData.description.length < 100}
                >
                  {loading ? 'Создание...' : 'Создать отель'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddHotelPage;