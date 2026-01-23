import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username_or_email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate('/dashboard'); // ✅ Переход в личный кабинет
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Вход в Wardrobe AI</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username или Email"
            value={credentials.username_or_email}
            onChange={(e) => setCredentials({ ...credentials, username_or_email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <button type="submit">Войти</button>
        </form>

        <p>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
