import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import './AdminCouponsPage.css';
import API from '../api';


const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  min_order: '',
  max_discount: '',
  category: '',
  product_id: '',
  expiry_date: '',
};

function AdminCouponsPage() {
  const adminKey = localStorage.getItem('adminKey');
  const [form, setForm] = useState(emptyForm);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/coupons`, {
        headers: { 'x-admin-key': adminKey },
      });
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch coupons error:', err);
      alert('Coupons load failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    if (!date) return 'No Expiry';
    return String(date).slice(0, 10);
  };

  const isExpired = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  };

  const createCoupon = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert('Coupon code required');
      return;
    }

    if (!form.value) {
      alert('Discount value required');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        value: Number(form.value || 0),
        min_order: Number(form.min_order || 0),
        max_discount: Number(form.max_discount || 0),
        category: form.category.trim() || '',
        product_id: form.product_id.trim() || '',
        expiry_date: form.expiry_date || '',
      };

      await axios.post(`${API}/admin/coupons`, payload, {
        headers: { 'x-admin-key': adminKey },
      });

      alert('Coupon created successfully');
      setForm(emptyForm);
      fetchCoupons();
    } catch (err) {
      console.error('Create coupon error:', err);
      alert(err.response?.data?.message || 'Coupon create failed. Please use unique coupon code.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await axios.put(
        `${API}/admin/coupons/${coupon.id}/status`,
        { is_active: !coupon.is_active },
        { headers: { 'x-admin-key': adminKey } }
      );

      fetchCoupons();
    } catch (err) {
      console.error('Coupon status error:', err);
      alert('Status update failed');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;

    try {
      await axios.delete(`${API}/admin/coupons/${id}`, {
        headers: { 'x-admin-key': adminKey },
      });

      fetchCoupons();
    } catch (err) {
      console.error('Coupon delete error:', err);
      alert('Delete failed');
    }
  };

  return (
    <AdminLayout
      title="Coupon Management"
      subtitle="Create, track, activate and apply coupons category-wise or product-wise."
      onRefresh={fetchCoupons}
    >
      <div className="coupon-card">
        <h2>Create New Coupon</h2>

        <form className="coupon-form" onSubmit={createCoupon}>
          <input name="code" value={form.code} onChange={handleChange} placeholder="Coupon Code e.g. OVI10" />

          <select name="type" value={form.type} onChange={handleChange}>
            <option value="percentage">Percentage %</option>
            <option value="flat">Flat ₹</option>
          </select>

          <input name="value" type="number" value={form.value} onChange={handleChange} placeholder="Value e.g. 10" />
          <input name="min_order" type="number" value={form.min_order} onChange={handleChange} placeholder="Min Order e.g. 499" />
          <input name="max_discount" type="number" value={form.max_discount} onChange={handleChange} placeholder="Max Discount e.g. 100" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category e.g. Masala / Rice" />
          <input name="product_id" value={form.product_id} onChange={handleChange} placeholder="Product ID optional" />
          <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} />

          <button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>
      </div>

      <div className="coupon-card">
        <h2>All Coupons</h2>

        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons created yet.</p>
        ) : (
          <div className="coupon-table-wrap">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Max Discount</th>
                  <th>Category</th>
                  <th>Product</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((c) => {
                  const expired = isExpired(c.expiry_date);

                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="coupon-code">{c.code}</span>
                      </td>

                      <td>
                        {c.type === 'percentage'
                          ? `${Number(c.value || 0)}% OFF`
                          : `₹${Number(c.value || 0)} OFF`}
                      </td>

                      <td>₹{Number(c.min_order || 0)}</td>
                      <td>₹{Number(c.max_discount || 0)}</td>
                      <td>{c.category || 'All Categories'}</td>
                      <td>{c.product_id ? `Product #${c.product_id}` : 'All Products'}</td>
                      <td>{formatDate(c.expiry_date)}</td>

                      <td>
                        {expired ? (
                          <span className="status-badge status-expired">Expired</span>
                        ) : c.is_active ? (
                          <span className="status-badge status-active">Active</span>
                        ) : (
                          <span className="status-badge status-inactive">Inactive</span>
                        )}
                      </td>

                      <td>
                        <div className="coupon-actions">
                          <button type="button" onClick={() => toggleStatus(c)}>
                            {c.is_active ? 'Disable' : 'Enable'}
                          </button>

                          <button type="button" className="delete" onClick={() => deleteCoupon(c.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminCouponsPage;