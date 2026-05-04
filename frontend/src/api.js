/**
 * Central API base URL used by the complete frontend.
 *
 * Localhost: set VITE_API_URL=http://localhost:5000 in frontend/.env
 * Live: set VITE_API_URL=https://your-backend-url.onrender.com in Vercel.
 */
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default API;
