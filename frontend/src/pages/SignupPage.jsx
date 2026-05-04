import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API}/auth/signup`, formData);

      localStorage.setItem('customerUser', JSON.stringify(response.data.user));
      alert('Account created successfully');
      navigate('/account');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Create Account</h1>
        <p style={subText}>Signup for faster checkout and account access</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            value={formData.fullName}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
          />

          {error && <div style={errorStyle}>{error}</div>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '18px', textAlign: 'center', color: '#6b6258' }}>
          Already have account?{' '}
          <Link to="/login" style={linkStyle}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const pageWrap = {
  minHeight: '100vh',
  background: '#f6f3ee',
  display: 'grid',
  placeItems: 'center',
  padding: '20px',
};

const cardStyle = {
  width: '100%',
  maxWidth: '520px',
  background: '#fff',
  border: '1px solid #ebe3d8',
  borderRadius: '22px',
  padding: '34px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
};

const headingStyle = {
  margin: 0,
  fontSize: '42px',
  textAlign: 'center',
  color: '#171717',
};

const subText = {
  marginTop: '10px',
  textAlign: 'center',
  color: '#6b6258',
  fontSize: '17px',
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid #ddd5c9',
  fontSize: '16px',
  marginBottom: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const buttonStyle = {
  width: '100%',
  border: 'none',
  background: '#2f5d3a',
  color: '#fff',
  padding: '14px 18px',
  borderRadius: '12px',
  fontWeight: '800',
  fontSize: '16px',
  cursor: 'pointer',
};

const errorStyle = {
  background: '#fff0ef',
  color: '#b42318',
  padding: '12px 14px',
  borderRadius: '10px',
  marginBottom: '14px',
  fontWeight: '700',
  textAlign: 'center',
};

const linkStyle = {
  color: '#2f5d3a',
  fontWeight: '800',
  textDecoration: 'none',
};

export default SignupPage;