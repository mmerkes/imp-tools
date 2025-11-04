// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import HomePage from '../pages/HomePage';

import { Route, Routes } from 'react-router-dom';
import BasePage from '../components/BasePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

export function App() {
  return (
      <Routes>
        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />
        <Route
          path="/"
          element={
            <BasePage title='IMP Tools'>
              <HomePage />
            </BasePage>
          }
        />
      </Routes>
  );
}

export default App;
