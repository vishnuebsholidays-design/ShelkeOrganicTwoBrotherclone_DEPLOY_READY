import './AdminLayout.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function AdminLayout({ children, title = 'Admin Panel', subtitle = 'Shelke Organic Store' }) {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('adminKey');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Admin Panel</h2>
          <p>Shelke Organic Store</p>
        </div>


        <nav className="admin-nav">
          <Link className={isActive('/admin/orders') ? 'active' : ''} to="/admin/orders">
            Orders
          </Link>

          <Link className={isActive('/admin/products') ? 'active' : ''} to="/admin/products">
            Products
          </Link>

          <Link className={isActive('/admin/memberships') ? 'active' : ''} to="/admin/memberships">
            Memberships
          </Link>


          <Link className={isActive('/admin/videos') ? 'active' : ''} to="/admin/videos">
            Watch Videos
          </Link>

          <Link className={isActive('/admin/coupons') ? 'active' : ''} to="/admin/coupons">
            Coupons
          </Link>
        </nav>

        <button className="admin-logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

export default AdminLayout;