import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Cancel, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { reservationService } from '../services/reservationService';
import { ReservationWithDetails } from '../types/reservation';

const UserReservationsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if ((currentUser?.role === 'manager' || currentUser?.role === 'admin') && userId) {
      fetchReservations();
    }
  }, [currentUser, userId]);

  const fetchReservations = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const reservationsData = await reservationService.getUserReservations(userId);
      setReservations(reservationsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке бронирований');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm('Вы уверены, что хотите отменить эту бронь?')) {
      return;
    }

    try {
      await reservationService.cancelReservation(reservationId);
      setSuccess('Бронь успешно отменена');
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при отмене брони');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'admin')) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">
            У вас нет доступа к этой странице
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!userId) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">
            ID пользователя не указан
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/users" color="inherit">
            Пользователи
          </Link>
          <Typography color="text.primary">
            Бронирования пользователя
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/users')}
            sx={{ mr: 2 }}
          >
            Назад
          </Button>
          <Typography variant="h4" component="h1">
            Бронирования пользователя
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
            <CircularProgress />
          </Box>
        ) : reservations.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              У пользователя нет бронирований
            </Typography>
          </Paper>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Список бронирований ({reservations.length})
            </Typography>
            {reservations.map((reservation, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom>
                        {reservation.hotel.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {reservation.hotel.description}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Описание номера:</strong> {reservation.hotelRoom.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {reservation.hotelRoom.images && reservation.hotelRoom.images.length > 0 && (
                          <Typography variant="body2">
                            <strong>Фотографии:</strong> {reservation.hotelRoom.images.length} шт.
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>Дата заезда:</strong><br />
                          {formatDate(reservation.startDate)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Дата выезда:</strong><br />
                          {formatDate(reservation.endDate)}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleCancelReservation(reservation.id)}
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          Отменить бронь
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default UserReservationsPage;