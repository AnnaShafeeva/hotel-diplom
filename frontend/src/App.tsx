import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { store } from './store';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import UsersPage from './pages/UsersPage';
import UserReservationsPage from './pages/UserReservationsPage';
import MyReservationsPage from './pages/MyReservationsPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import AddHotelPage from './pages/AddHotelPage';
import AddHotelRoomPage from './pages/AddHotelRoomPage';
import HotelsManagementPage from './pages/HotelsManagementPage';
import EditHotelRoomPage from './pages/EditHotelRoomPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#01939A',
    },
    secondary: {
      main: '#34C6CD',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/user-reservations/:userId" element={<UserReservationsPage />} />
                <Route path="/my-reservations" element={<MyReservationsPage />} />
                <Route path="/hotel/:roomId" element={<HotelDetailsPage />} />
                <Route path="/admin/hotels" element={<HotelsManagementPage />} />
                <Route path="/admin/add-hotel" element={<AddHotelPage />} />
                <Route path="/admin/add-hotel-room" element={<AddHotelRoomPage />} />
                <Route path="/admin/add-hotel-room/:hotelId" element={<AddHotelRoomPage />} />
                <Route path="/admin/edit-hotel-room/:roomId" element={<EditHotelRoomPage />} />
              </Routes>
            </Layout>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;