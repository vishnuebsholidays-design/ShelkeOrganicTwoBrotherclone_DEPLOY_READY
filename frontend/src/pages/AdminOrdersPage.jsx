import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import API from '../api';

const PAGE_SIZE = 5;

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const adminKey = localStorage.getItem('adminKey');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API}/admin/orders`, {
        headers: { 'x-admin-key': adminKey },
      });

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Admin orders fetch error:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('adminKey');
        navigate('/admin/login');
        return;
      }

      setError('Failed to load admin orders.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    const search = searchText.trim().toLowerCase();

    if (search) {
      list = list.filter((order) =>
        [order.id, order.full_name, order.phone, order.email, order.city, order.state, order.status, order.payment_method, order.payment_status, order.payment_label]
          .some((value) => String(value || '').toLowerCase().includes(search))
      );
    }

    if (statusFilter !== 'All') {
      list = list.filter((order) => order.status === statusFilter);
    }

    return list;
  }, [orders, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage, totalPages]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    confirmed: orders.filter((o) => o.status === 'Confirmed').length,
    shipped: orders.filter((o) => o.status === 'Shipped').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    prepaid: orders.filter((o) => o.payment_method === 'online').length,
    cod: orders.filter((o) => !o.payment_method || o.payment_method === 'cod').length,
  }), [orders]);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status`,
        { status },
        { headers: { 'x-admin-key': adminKey } }
      );

      setOrders((prev) => prev.map((item) => (
        item.id === orderId ? { ...item, status } : item
      )));
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update order status');
    }
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  return (
    <AdminLayout
      title="Orders Management"
      subtitle="Manage customer orders and delivery status."
      onRefresh={fetchOrders}
    >
      <div className="admin-stats-grid">
        <Stat title="Total Orders" value={stats.total} />
        <Stat title="Pending" value={stats.pending} />
        <Stat title="Confirmed" value={stats.confirmed} />
        <Stat title="Shipped" value={stats.shipped} />
        <Stat title="Delivered" value={stats.delivered} />
        <Stat title="Prepaid" value={stats.prepaid} />
        <Stat title="COD / Manual" value={stats.cod} />
      </div>

      <div className="admin-filter-card">
        <input
          className="admin-input"
          placeholder="Search by order id, name, phone, email, city..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <div className="admin-message">Loading orders...</div> : null}
      {!loading && error ? <div className="admin-error">{error}</div> : null}
      {!loading && !error && filteredOrders.length === 0 ? (
        <div className="admin-message">No matching orders found.</div>
      ) : null}

      {!loading && !error && filteredOrders.length > 0 ? (
        <>
          <div className="admin-table-card">
            <div className="admin-table-scroll">
              <table className="admin-table admin-orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="nowrap"><strong>#{order.id}</strong></td>

                      <td>
                        <strong className="table-main-text">{order.full_name || '-'}</strong>
                        <small className="table-sub-text">{order.email || '-'}</small>
                      </td>

                      <td>
                        <small className="table-sub-text">{order.phone || '-'}</small>
                      </td>

                      <td>
                        <small className="table-sub-text">
                          {order.city || '-'}, {order.state || '-'}
                        </small>
                      </td>

                      <td className="nowrap">
                        <strong>₹{Number(order.grand_total || 0).toFixed(2)}</strong>
                      </td>

                      <td>
                        <PaymentBadge order={order} />
                      </td>

                      <td>
                        <span className={`admin-status-pill ${order.status}`}>
                          {order.status}
                        </span>

                        <select
                          className="admin-select admin-status-select"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Packed</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>

                      <td>
                        <small className="table-sub-text">{formatDate(order.created_at)}</small>
                      </td>

                      <td>
                        <Link className="admin-btn-light" to={`/admin/orders/${order.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-pagination">
            <div className="admin-pagination-info">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}
              {' '}to {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}
              {' '}of {filteredOrders.length} orders
            </div>

            <div className="admin-pagination-actions">
              <button
                type="button"
                className="admin-page-btn"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`admin-page-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="admin-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
}


function PaymentBadge({ order }) {
  const isOnline = order.payment_method === 'online';
  const label = order.payment_label || (isOnline ? 'Prepaid / Razorpay' : 'COD / Manual');

  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      <span
        style={{
          display: 'inline-block',
          width: 'max-content',
          padding: '7px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '900',
          background: isOnline ? '#eaf8f0' : '#fff6e7',
          color: isOnline ? '#198754' : '#b57600',
        }}
      >
        {label}
      </span>
      <small className="table-sub-text">
        {order.payment_status || (isOnline ? 'Paid' : 'Pending')}
      </small>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="admin-stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

export default AdminOrdersPage;
