import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Добро пожаловать в HotelAggregator
        </Typography>
        <Typography variant="h6" component="p" gutterBottom align="center" color="text.secondary">
          Найдите идеальный отель для вашего отдыха
        </Typography>
        
        {isAuthenticated ? (
          <Paper elevation={2} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom color="primary">
              Здравствуйте, {user?.name}!
            </Typography>
            <Typography variant="body1">
              Рады видеть вас снова. Используйте навигацию для поиска отелей или управления бронированиями.
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
            <Typography variant="body1">
              Для бронирования отелей войдите в систему или зарегистрируйтесь.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;