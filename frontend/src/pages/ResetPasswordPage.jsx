import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Please fill both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');

      const response = await axios.post(`${API}/auth/reset-password`, {
        token,
        newPassword,
      });

      setMessage(response.data.message || 'Password reset successful');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Reset Password</h1>
        <p style={subText}>Enter your new password below</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />

          {error && <div style={errorStyle}>{error}</div>}
          {message && <div style={successStyle}>{message}</div>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ marginTop: '18px', textAlign: 'center', color: '#6b6258' }}>
          Back to{' '}
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

const successStyle = {
  background: '#eef9ef',
  color: '#198754',
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

export default ResetPasswordPage;