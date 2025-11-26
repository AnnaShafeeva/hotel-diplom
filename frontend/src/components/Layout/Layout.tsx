import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HotelAggregator
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              variant={location.pathname === '/' ? 'outlined' : 'text'}
            >
              Все гостиницы
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/search"
              variant={location.pathname === '/search' ? 'outlined' : 'text'}
            >
              Поиск номера
            </Button>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin/hotels"
                      variant={location.pathname.startsWith('/admin/hotels') ? 'outlined' : 'text'}
                    >
                      Управление отелями
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/users"
                      variant={location.pathname === '/users' ? 'outlined' : 'text'}
                    >
                      Пользователи
                    </Button>
                  </>
                )}
                {user?.role === 'manager' && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/users"
                    variant={location.pathname === '/users' ? 'outlined' : 'text'}
                  >
                    Пользователи
                  </Button>
                )}
                {user?.role === 'client' && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/my-reservations"
                    variant={location.pathname === '/my-reservations' ? 'outlined' : 'text'}
                  >
                    Мои брони
                  </Button>
                )}
                <Typography variant="body1" sx={{ mx: 1 }}>
                  #{user?.name}
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                  Выход
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Вход
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Регистрация
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;