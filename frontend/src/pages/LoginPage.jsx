import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api';

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('customerUser');

    if (savedUser) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data?.user) {
        localStorage.setItem('customerUser', JSON.stringify(response.data.user));

        const redirectPath = localStorage.getItem('customerRedirectAfterLogin') || '/';
        localStorage.removeItem('customerRedirectAfterLogin');

        navigate(redirectPath);
        window.location.reload();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <Header />

      <div style={container}>
        <div style={card}>
          <h1 style={title}>Customer Login</h1>
          <p style={subtitle}>Login to manage your orders, address, and membership.</p>

          {error && <div style={errorBox}>{error}</div>}

          <form onSubmit={handleLogin} style={form}>
            <div style={field}>
              <label style={label}>Email Address</label>
              <input
                style={input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={field}>
              <label style={label}>Password</label>
              <input
                style={input}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" style={button} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={bottomLinks}>
            <Link to="/forgot-password" style={link}>
              Forgot Password?
            </Link>

            <p style={signupText}>
              New customer?{' '}
              <Link to="/signup" style={link}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const page = {
  background: '#f6f3ee',
  minHeight: '100vh',
};

const container = {
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '60px 18px',
  display: 'flex',
  justifyContent: 'center',
};

const card = {
  width: '100%',
  maxWidth: '460px',
  background: '#fff',
  border: '1px solid #ebe3d8',
  borderRadius: '18px',
  padding: '30px',
  boxShadow: '0 8px 22px rgba(0,0,0,0.04)',
};

const title = {
  margin: '0 0 8px',
  textAlign: 'center',
  fontSize: '30px',
  fontWeight: '900',
  color: '#171717',
};

const subtitle = {
  margin: '0 0 22px',
  textAlign: 'center',
  color: '#6b6258',
  fontSize: '14px',
  lineHeight: '1.6',
};

const form = {
  display: 'grid',
  gap: '14px',
};

const field = {
  display: 'grid',
  gap: '6px',
};

const label = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#5f564d',
};

const input = {
  width: '100%',
  border: '1px solid #ddd5c9',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '14px',
  outline: 'none',
};

const button = {
  width: '100%',
  border: 'none',
  background: '#2f5d3a',
  color: '#fff',
  padding: '13px 16px',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  marginTop: '8px',
};

const errorBox = {
  background: '#fff0ef',
  color: '#b42318',
  border: '1px solid #ffd1cc',
  borderRadius: '10px',
  padding: '12px',
  fontSize: '13px',
  fontWeight: '700',
  marginBottom: '14px',
  textAlign: 'center',
};

const bottomLinks = {
  marginTop: '18px',
  textAlign: 'center',
};

const link = {
  color: '#2f5d3a',
  fontWeight: '800',
  textDecoration: 'none',
};

const signupText = {
  marginTop: '14px',
  color: '#6b6258',
  fontSize: '14px',
};

export default LoginPage;