import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API from '../api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      setError('');
      setResetUrl('');

      const response = await axios.post(`${API}/auth/forgot-password`, {
        email,
      });

      setMessage(response.data.message || 'Reset link generated');
      setResetUrl(response.data.resetUrl || '');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.error || 'Failed to generate reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Forgot Password</h1>
        <p style={subText}>Enter your email to generate a reset link</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          {error && <div style={errorStyle}>{error}</div>}
          {message && <div style={successStyle}>{message}</div>}

          {resetUrl && (
            <div style={linkBoxStyle}>
              <div style={{ fontWeight: '800', marginBottom: '8px', color: '#2f5d3a' }}>
                Test Reset Link
              </div>
              <a href={resetUrl} style={resetLinkStyle}>
                {resetUrl}
              </a>
            </div>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Generating...' : 'Generate Reset Link'}
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

const linkBoxStyle = {
  background: '#faf8f4',
  border: '1px solid #ebe3d8',
  padding: '14px',
  borderRadius: '12px',
  marginBottom: '14px',
  wordBreak: 'break-word',
};

const resetLinkStyle = {
  color: '#2f5d3a',
  fontWeight: '700',
  textDecoration: 'none',
};

const linkStyle = {
  color: '#2f5d3a',
  fontWeight: '800',
  textDecoration: 'none',
};

export default ForgotPasswordPage;