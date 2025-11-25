import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Add, Search, Visibility } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { User, SearchUserParams } from '../types/user';
import { userService } from '../services/userService';
import { Link as RouterLink } from 'react-router-dom';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchUserParams>({
    limit: 10,
    offset: 0,
    email: '',
    name: '',
    contactPhone: '',
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    contactPhone: '',
    role: 'client' as 'client' | 'admin' | 'manager',
  });

  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let usersData: User[];
      if (currentUser?.role === 'admin') {
        usersData = await userService.getUsers(searchParams);
      } else {
        usersData = await userService.getUsersManager(searchParams);
      }
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleCreateUser = async () => {
    try {
      await userService.createUser(newUser);
      setSuccess('Пользователь успешно создан');
      setCreateDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        name: '',
        contactPhone: '',
        role: 'client',
      });

      const resetParams = {
        limit: 10,
        offset: 0,
        email: '',
        name: '',
        contactPhone: '',
      };

      setSearchParams(resetParams);

      setLoading(true);
      let usersData: User[];
      if (currentUser?.role === 'admin') {
        usersData = await userService.getUsers(resetParams);
      } else {
        usersData = await userService.getUsersManager(resetParams);
      }
      setUsers(usersData);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании пользователя');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'client': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Пользователи
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Поиск пользователей
            </Typography>
            {currentUser.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Добавить пользователя
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              label="Email"
              name="email"
              value={searchParams.email}
              onChange={handleSearchChange}
              size="small"
            />
            <TextField
              label="Имя"
              name="name"
              value={searchParams.name}
              onChange={handleSearchChange}
              size="small"
            />
            <TextField
              label="Телефон"
              name="contactPhone"
              value={searchParams.contactPhone}
              onChange={handleSearchChange}
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading}
            >
              Поиск
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>ФИО</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Дата регистрации</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user._id?.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.contactPhone || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        component={RouterLink}
                        to={`/user-reservations/${user._id}`}
                        title="Просмотреть бронирования"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && users.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Пользователи не найдены
          </Alert>
        )}
      </Box>
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Имя"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <TextField
              label="Пароль"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              required
              helperText="Минимум 6 символов"
            />
            <TextField
              label="Телефон"
              value={newUser.contactPhone}
              onChange={(e) => setNewUser(prev => ({ ...prev, contactPhone: e.target.value }))}
            />
            <TextField
              select
              label="Роль"
              value={newUser.role}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
            >
              <MenuItem value="client">Клиент</MenuItem>
              <MenuItem value="manager">Менеджер</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={!newUser.name || !newUser.email || !newUser.password}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Container>
  );
};

export default UsersPage;