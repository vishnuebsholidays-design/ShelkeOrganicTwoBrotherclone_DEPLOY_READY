import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import API from '../api';

const PAGE_SIZE = 10;

function AdminMembershipsPage() {
  const navigate = useNavigate();
  const adminKey = localStorage.getItem('adminKey');

  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API}/admin/memberships`, {
        headers: { 'x-admin-key': adminKey },
      });

      setMemberships(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Membership fetch error:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('adminKey');
        navigate('/admin/login');
        return;
      }

      setError('Failed to load membership requests. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMemberships = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return memberships.filter((item) => {
      const matchesSearch = !search || [
        item.id,
        item.customer_name,
        item.customer_email,
        item.customer_phone,
        item.plan_name,
        item.city,
        item.state,
        item.payment_method,
        item.status,
      ].some((value) => String(value || '').toLowerCase().includes(search));

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [memberships, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMemberships.length / PAGE_SIZE));

  const paginatedMemberships = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMemberships.slice(start, start + PAGE_SIZE);
  }, [filteredMemberships, currentPage]);

  const stats = useMemo(() => ({
    total: memberships.length,
    pending: memberships.filter((m) => m.status === 'Pending').length,
    active: memberships.filter((m) => m.status === 'Active').length,
    rejected: memberships.filter((m) => m.status === 'Rejected' || m.status === 'Expired').length,
  }), [memberships]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API}/admin/memberships/${id}/status`,
        { status },
        { headers: { 'x-admin-key': adminKey } }
      );

      await fetchMemberships();
    } catch (err) {
      console.error('Membership status update error:', err);
      alert('Failed to update membership status');
    }
  };

  return (
    <AdminLayout
      title="Membership Management"
      subtitle="View customer membership requests, filter records, and activate plans."
    >
      <div className="membership-top-action">
        <Link className="membership-plan-action-btn" to="/admin/membership-plans">
          Membership Plans
        </Link>
      </div>

      <div className="admin-stats-grid">
        <Stat title="Total Requests" value={stats.total} />
        <Stat title="Pending" value={stats.pending} />
        <Stat title="Active" value={stats.active} />
        <Stat title="Rejected / Expired" value={stats.rejected} />
      </div>

      <div className="admin-filter-card membership-filter-card">
        <input
          className="admin-input"
          placeholder="Search by name, email, phone, plan, city..."
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
          <option value="Active">Active</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>

        <button type="button" className="admin-refresh-btn" onClick={fetchMemberships}>
          Refresh
        </button>
      </div>

      {loading ? <div className="admin-message">Loading memberships...</div> : null}
      {!loading && error ? <div className="admin-error">{error}</div> : null}
      {!loading && !error && filteredMemberships.length === 0 ? (
        <div className="admin-message">No membership requests found.</div>
      ) : null}

      {!loading && !error && filteredMemberships.length > 0 ? (
        <div className="admin-table-card membership-table-card">
          <div className="admin-table-topbar">
            <strong>
              Showing {paginatedMemberships.length} of {filteredMemberships.length} records
            </strong>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-table membership-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th className="col-customer">Customer</th>
                  <th className="col-plan">Plan</th>
                  <th className="col-amount">Amount</th>
                  <th className="col-location">Location</th>
                  <th className="col-payment">Payment</th>
                  <th className="col-status">Status</th>
                  <th className="col-dates">Dates</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedMemberships.map((item) => (
                  <tr key={item.id}>
                    <td className="col-id"><strong>#{item.id}</strong></td>

                    <td className="col-customer">
                      <div className="admin-cell-stack">
                        <strong>{item.customer_name || '-'}</strong>
                        <small>{item.customer_email || '-'}</small>
                        <small>{item.customer_phone || '-'}</small>
                      </div>
                    </td>

                    <td className="col-plan">
                      <div className="admin-cell-stack">
                        <strong>{item.plan_name || '-'}</strong>
                        <small>{item.validity || '1 Year'}</small>
                      </div>
                    </td>

                    <td className="col-amount"><strong>₹{Number(item.total || 0).toFixed(2)}</strong></td>

                    <td className="col-location">
                      <small>{formatLocation(item.city, item.state)}</small>
                    </td>

                    <td className="col-payment">
                      <small>{item.payment_method || 'manual'}</small>
                    </td>

                    <td className="col-status">
                      <span className={`admin-status-pill status-${String(item.status || '').toLowerCase()}`}>
                        {item.status || '-'}
                      </span>
                    </td>

                    <td className="col-dates">
                      <div className="admin-cell-stack">
                        <small>Created: {formatDate(item.created_at)}</small>
                        <small>Expiry: {formatDate(item.expiry_date)}</small>
                      </div>
                    </td>

                    <td className="col-action">
                      <select
                        className="admin-select action-select"
                        value={item.status || 'Pending'}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={page === currentPage ? 'active' : ''}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </AdminLayout>
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
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN');
}

function formatLocation(city, state) {
  const parts = [city, state].filter(Boolean);
  return parts.length ? parts.join(', ') : '-';
}

export default AdminMembershipsPage;
