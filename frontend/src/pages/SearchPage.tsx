import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Pagination,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Search, Hotel, CalendarToday } from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import { Hotel as HotelType, HotelRoom, SearchRoomsParams } from '../types/hotel';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    hotel: null as HotelType | null,
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
  });
  const [allHotels, setAllHotels] = useState<HotelType[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0
  });

  useEffect(() => {
    fetchAllHotels();
  }, []);

  const fetchAllHotels = async () => {
    setHotelsLoading(true);
    try {
      const hotels = await hotelService.searchHotels({ limit: 100, offset: 0 });
      setAllHotels(hotels);
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
    } finally {
      setHotelsLoading(false);
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

  const handleSearch = async (newOffset: number = 0) => {
    if (!searchParams.startDate || !searchParams.endDate) {
      setError('Пожалуйста, выберите даты заезда и выезда');
      return;
    }

    if (searchParams.startDate.isAfter(searchParams.endDate)) {
      setError('Дата заезда не может быть позже даты выезда');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiParams: SearchRoomsParams = {
        limit: pagination.limit,
        offset: newOffset,
        isEnabled: true,
        startDate: searchParams.startDate.format('YYYY-MM-DD'),
        endDate: searchParams.endDate.format('YYYY-MM-DD')
      };

      if (searchParams.hotel) {
        apiParams.hotel = searchParams.hotel.id;
      }

      const rooms = await hotelService.searchRooms(apiParams);
      setSearchResults(rooms);
      setPagination(prev => ({ ...prev, offset: newOffset }));

    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при поиске отелей');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (roomId: string) => {
    navigate(`/hotel/${roomId}`, {
      state: {
        startDate: searchParams.startDate?.format('YYYY-MM-DD'),
        endDate: searchParams.endDate?.format('YYYY-MM-DD'),
        hotelName: searchParams.hotel?.title
      }
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    handleSearch(newOffset);
  };

  const formatDate = (date: Dayjs | null) => {
    return date ? date.format('DD.MM.YYYY') : '';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Главная
        </Link>
        <Typography color="text.primary">Поиск номеров</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Поиск номеров
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="end">
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={allHotels}
              getOptionLabel={(option) => option.title}
              value={searchParams.hotel}
              onChange={(event, newValue) => {
                setSearchParams(prev => ({
                  ...prev,
                  hotel: newValue
                }));

              }}
              sx={{
                minWidth: 250,
                '& .MuiAutocomplete-root': {
                  minWidth: 250
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Выберите гостиницу"
                  placeholder="Начните вводить название..."
                  variant="outlined"
                />
              )}
              loading={hotelsLoading}
              renderOption={(props, option) => (
                <MenuItem {...props} key={option.id} >
                  <Box>
                    <Typography variant="body1">
                      {option.title}
                    </Typography>
                  </Box>
                </MenuItem>
              )}
              noOptionsText="Отели не найдены"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="Заезд"
              value={searchParams.startDate}
              onChange={(date) => setSearchParams(prev => ({
                ...prev,
                startDate: date
              }))}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined"
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="Выезд"
              value={searchParams.endDate}
              onChange={(date) => setSearchParams(prev => ({
                ...prev,
                endDate: date
              }))}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined"
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Search />}
              onClick={() => handleSearch(0)}
              disabled={loading || !searchParams.startDate || !searchParams.endDate}
              sx={{ height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Искать'}
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {(searchParams.startDate || searchParams.endDate) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(searchParams.startDate)} - {formatDate(searchParams.endDate)}
              </Typography>
            </Box>
          )}
          {searchParams.hotel && (
            <Chip
              label={`Отель: ${searchParams.hotel.title}`}
              variant="outlined"
              size="small"
              onDelete={() => setSearchParams(prev => ({ ...prev, hotel: null }))}
            />
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box>
        {searchResults.length > 0 && (
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Найдено номеров: {searchResults.length}
            {searchParams.hotel && ` в отеле "${searchParams.hotel.title}"`}
          </Typography>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ my: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : searchResults.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Hotel sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchParams.startDate && searchParams.endDate
                ? 'По вашему запросу номеров не найдено'
                : 'Введите даты заезда и выезда для поиска номеров'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchParams.hotel
                ? 'Попробуйте изменить даты или выбрать другой отель'
                : 'Измените параметры поиска или попробуйте другие даты'
              }
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {searchResults.map((room) => (
                <Grid item xs={12} key={room.id}>
                  <Card sx={{ display: 'flex', height: 200 }}>
                    {room.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        sx={{ width: 300 }}
                        image={getImageUrl(room.images[0])}
                        alt={room.hotel.title}
                        onError={(e) => {
                          console.error('Image load error for:', room.images[0]);
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 300,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Hotel sx={{ fontSize: 48, color: 'grey.400' }} />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography variant="h6" gutterBottom>
                          {room.hotel.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {room.description || 'Описание отсутствует'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label="Доступно для бронирования"
                            color="success"
                            size="small"
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewDetails(room.id)}
                          >
                            Подробнее
                          </Button>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pagination.total > pagination.limit && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(pagination.total / pagination.limit)}
                  page={Math.floor(pagination.offset / pagination.limit) + 1}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default SearchPage;