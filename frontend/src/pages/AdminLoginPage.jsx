import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API}/admin/login`, {
        password,
      });

      if (response.data.success) {
        localStorage.setItem('adminKey', password);
        navigate('/admin/orders');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f3ee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#fff',
          borderRadius: '22px',
          padding: '36px',
          border: '1px solid #e8dfd3',
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
        }}
      >
        <h1
          style={{
            fontSize: '38px',
            marginBottom: '10px',
            color: '#171717',
            textAlign: 'center',
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#6b6258',
            marginBottom: '24px',
            fontSize: '16px',
          }}
        >
          Separate admin access for order management
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #d8d0c4',
              fontSize: '16px',
              marginBottom: '16px',
              outline: 'none',
            }}
          />

          {error && (
            <div
              style={{
                background: '#fff0ef',
                color: '#b42318',
                padding: '12px 14px',
                borderRadius: '10px',
                fontWeight: '700',
                marginBottom: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#7a9c82' : '#2f5d3a',
              color: '#fff',
              border: 'none',
              padding: '14px 18px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;