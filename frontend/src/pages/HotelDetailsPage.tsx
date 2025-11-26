import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Grid,
    Box,
    Typography,
    Button,
    Card,
    CardMedia,
    Chip,
    Alert,
    CircularProgress,
    Breadcrumbs,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    CalendarToday,
    Hotel,
    ArrowBack,
    BookOnline,
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hotelService } from '../services/hotelService';
import { reservationService } from '../services/reservationService';
import { HotelRoom } from '../types/hotel';
import { CreateReservationData } from '../types/reservation';

const HotelDetailsPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const searchParams = location.state as {
        startDate: string;
        endDate: string;
        hotelName?: string;
    } | null;

    const [room, setRoom] = useState<HotelRoom | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');

    const getImageUrl = (imagePath: string) => {
        console.log('Original image path:', imagePath);

        if (imagePath.startsWith('http')) return imagePath;

        if (imagePath.startsWith('/uploads')) {
            return `http://localhost:3000${imagePath}`;
        }

        if (imagePath.startsWith('uploads/')) {
            return `http://localhost:3000/${imagePath}`;
        }

        return `http://localhost:3000/uploads/${imagePath}`;
    };

    useEffect(() => {
        if (roomId) {
            fetchRoomDetails();
        }
    }, [roomId]);

    const fetchRoomDetails = async () => {
        if (!roomId) return;

        setLoading(true);
        setError(null);

        try {
            const roomData = await hotelService.getRoomById(roomId);
            setRoom(roomData);
            setSelectedRoomId(roomId);

            console.log('Room data loaded:', roomData);
            console.log('Room images:', roomData.images);
            if (roomData.images && roomData.images.length > 0) {
                console.log('Image URLs:', roomData.images.map(img => getImageUrl(img)));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при загрузке информации о номере');
            console.error('Error fetching room details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookRoom = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (!searchParams?.startDate || !searchParams?.endDate) {
            setError('Необходимо выбрать даты заезда и выезда');
            return;
        }

        setBookingLoading(true);
        setError(null);

        try {
            const reservationData: CreateReservationData = {
                hotelRoom: selectedRoomId,
                startDate: searchParams.startDate,
                endDate: searchParams.endDate,
            };

            await reservationService.createReservation(reservationData);
            setBookingSuccess(true);
            setBookingDialogOpen(false);

            setTimeout(() => {
                navigate('/my-reservations');
            }, 3000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при бронировании номера');
            console.error('Booking error:', err);
        } finally {
            setBookingLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const calculateNights = () => {
        if (!searchParams?.startDate || !searchParams?.endDate) return 0;
        const start = new Date(searchParams.startDate);
        const end = new Date(searchParams.endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    if (error && !room) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/search')}>
                    Вернуться к поиску
                </Button>
            </Container>
        );
    }

    if (!room) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    Информация о номере не найдена
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/search')} sx={{ mt: 2 }}>
                    Вернуться к поиску
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/" color="inherit">
                    Главная
                </Link>
                <Link component={RouterLink} to="/search" color="inherit">
                    Поиск номеров
                </Link>
                <Typography color="text.primary">{room.hotel.title}</Typography>
            </Breadcrumbs>

            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Назад
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {bookingSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Номер успешно забронирован! Перенаправляем к вашим бронированиям...
                </Alert>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        {room.images.length > 0 ? (
                            <Grid container spacing={1}>
                                {room.images.map((image, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={getImageUrl(image)}
                                                alt={`${room.hotel.title} - фото ${index + 1}`}
                                                sx={{ objectFit: 'cover' }}
                                                onError={(e) => {
                                                    console.error('Image load error for:', image);
                                                    console.error('Full URL:', getImageUrl(image));
                                                }}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box
                                sx={{
                                    height: 300,
                                    bgcolor: 'grey.200',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1
                                }}
                            >
                                <Hotel sx={{ fontSize: 64, color: 'grey.400' }} />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                    Фотографии отсутствуют
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {room.hotel.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {room.hotel.description || 'Описание отеля отсутствует'}
                        </Typography>
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Описание номера
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {room.description || 'Описание номера отсутствует'}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 100 }}>
                        <Typography variant="h6" gutterBottom>
                            Бронирование номера
                        </Typography>

                        {searchParams && (
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CalendarToday fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {formatDate(searchParams.startDate)} - {formatDate(searchParams.endDate)}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {calculateNights()} ночей
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Статус:
                            </Typography>
                            <Chip label="Доступно" color="success" size="small" />
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<BookOnline />}
                            onClick={() => setBookingDialogOpen(true)}
                            disabled={!searchParams?.startDate || !searchParams?.endDate}
                        >
                            Забронировать
                        </Button>

                        {(!searchParams?.startDate || !searchParams?.endDate) && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                                Выберите даты заезда и выезда для бронирования
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Подтверждение бронирования</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Вы уверены, что хотите забронировать этот номер?
                    </Typography>

                    {searchParams && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Отель:</strong> {room.hotel.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Даты:</strong> {formatDate(searchParams.startDate)} - {formatDate(searchParams.endDate)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Количество ночей:</strong> {calculateNights()}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBookingDialogOpen(false)} disabled={bookingLoading}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleBookRoom}
                        variant="contained"
                        disabled={bookingLoading}
                        startIcon={bookingLoading ? <CircularProgress size={20} /> : null}
                    >
                        {bookingLoading ? 'Бронируем...' : 'Подтвердить бронь'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default HotelDetailsPage;