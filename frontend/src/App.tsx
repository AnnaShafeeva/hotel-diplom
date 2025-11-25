import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import UserReservationsPage from './pages/UserReservationsPage';
import MyReservationsPage from './pages/MyReservationsPage';

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
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/user-reservations/:userId" element={<UserReservationsPage />} />
              <Route path="/my-reservations" element={<MyReservationsPage />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;