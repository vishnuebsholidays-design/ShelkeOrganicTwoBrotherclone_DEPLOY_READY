import './AdminMembershipPlansPage.css';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import API from '../api';


const emptyForm = {
  plan_key: '',
  name: '',
  price: '',
  old_price: '',
  duration_months: 12,
  badge: '',
  discount_percent: '',
  description: '',
  benefits: '',
  perks_rules: '',
  is_featured: false,
  is_active: true,
};

function AdminMembershipPlansPage() {
  const navigate = useNavigate();
  const adminKey = localStorage.getItem('adminKey');
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headers = useMemo(() => ({ 'x-admin-key': adminKey }), [adminKey]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API}/admin/membership-plans`, { headers });
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Membership plans fetch error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminKey');
        navigate('/admin/login');
        return;
      }
      setError('Failed to load membership plans. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const startEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      plan_key: plan.plan_key || '',
      name: plan.name || '',
      price: plan.price ?? '',
      old_price: plan.old_price ?? '',
      duration_months: plan.duration_months || 12,
      badge: plan.badge || '',
      discount_percent: plan.discount_percent ?? '',
      description: plan.description || '',
      benefits: Array.isArray(plan.benefits)
        ? plan.benefits.join('\n')
        : String(plan.benefits || '').split('|').join('\n'),
      perks_rules: plan.perks_rules || '',
      is_featured: Boolean(plan.is_featured),
      is_active: Boolean(plan.is_active),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        plan_key: form.plan_key.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        price: Number(form.price || 0),
        old_price: Number(form.old_price || 0),
        duration_months: Number(form.duration_months || 12),
        discount_percent: Number(form.discount_percent || 0),
        benefits: form.benefits
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (!payload.plan_key || !payload.name || payload.price <= 0) {
        setError('Plan key, plan name and valid price are required.');
        return;
      }

      if (editingId) {
        await axios.put(`${API}/admin/membership-plans/${editingId}`, payload, { headers });
        setSuccess('Membership plan updated successfully.');
      } else {
        await axios.post(`${API}/admin/membership-plans`, payload, { headers });
        setSuccess('Membership plan created successfully.');
      }

      resetForm();
      await fetchPlans();
    } catch (err) {
      console.error('Membership plan save error:', err);
      setError(err.response?.data?.error || 'Failed to save membership plan.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan) => {
    try {
      await axios.put(
        `${API}/admin/membership-plans/${plan.id}`,
        { ...plan, is_active: !plan.is_active, benefits: plan.benefits || [] },
        { headers }
      );
      await fetchPlans();
    } catch (err) {
      console.error('Plan status error:', err);
      alert('Failed to update plan status');
    }
  };

  return (
    <AdminLayout
      title="Membership Plans"
      subtitle="Create plans, pricing, duration, perks, discount rules and expiry management."
    >
      <form className="plan-form-card" onSubmit={submitForm}>
        <div className="plan-form-head">
          <div>
            <h2>{editingId ? 'Edit Membership Plan' : 'Create Membership Plan'}</h2>
            <p>These plans will show on customer membership page and checkout.</p>
          </div>
          {editingId ? (
            <button type="button" className="plan-secondary-btn" onClick={resetForm}>Cancel Edit</button>
          ) : null}
        </div>

        {error ? <div className="admin-error">{error}</div> : null}
        {success ? <div className="plan-success-box">{success}</div> : null}

        <div className="plan-form-grid">
          <Field label="Plan Key *" hint="Example: silver, gold, platinum">
            <input name="plan_key" value={form.plan_key} onChange={handleChange} placeholder="gold" />
          </Field>

          <Field label="Plan Name *">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Gold" />
          </Field>

          <Field label="Price *">
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="999" />
          </Field>

          <Field label="Old Price">
            <input type="number" name="old_price" value={form.old_price} onChange={handleChange} placeholder="1299" />
          </Field>

          <Field label="Duration Months *">
            <input type="number" name="duration_months" value={form.duration_months} onChange={handleChange} placeholder="12" />
          </Field>

          <Field label="Discount % *">
            <input type="number" name="discount_percent" value={form.discount_percent} onChange={handleChange} placeholder="10" />
          </Field>

          <Field label="Badge">
            <input name="badge" value={form.badge} onChange={handleChange} placeholder="Most Popular" />
          </Field>

          <Field label="Description" full>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} placeholder="Short plan description" />
          </Field>

          <Field label="Benefits / Perks" hint="One benefit per line" full>
            <textarea name="benefits" rows="5" value={form.benefits} onChange={handleChange} placeholder="10% member discount\nPriority support\nEarly access offers" />
          </Field>

          <Field label="Perks Rules" hint="Internal rules visible to admin" full>
            <textarea name="perks_rules" rows="4" value={form.perks_rules} onChange={handleChange} placeholder="Discount applies on eligible products. Not clubbed with selected coupons." />
          </Field>

          <label className="plan-check-row">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
            Mark as featured plan
          </label>

          <label className="plan-check-row">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Show plan to customers
          </label>
        </div>

        <button type="submit" className="plan-save-btn" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
        </button>
      </form>

      <div className="admin-table-card plan-table-card">
        <div className="admin-table-topbar">
          <strong>Membership Plans</strong>
          <button type="button" className="admin-refresh-btn" onClick={fetchPlans}>Refresh</button>
        </div>

        {loading ? <div className="admin-message">Loading plans...</div> : null}
        {!loading && plans.length === 0 ? <div className="admin-message">No plans found.</div> : null}

        {!loading && plans.length > 0 ? (
          <div className="admin-table-scroll">
            <table className="admin-table membership-plan-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Discount</th>
                  <th>Benefits</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <strong>{plan.name}</strong><br />
                      <small>{plan.plan_key}</small>
                      {plan.is_featured ? <span className="plan-mini-badge">Featured</span> : null}
                    </td>
                    <td>
                      <strong>₹{Number(plan.price || 0).toFixed(2)}</strong><br />
                      {Number(plan.old_price || 0) > 0 ? <small>Old ₹{Number(plan.old_price).toFixed(2)}</small> : null}
                    </td>
                    <td>{plan.duration_months || 12} Months</td>
                    <td>{Number(plan.discount_percent || 0)}% OFF</td>
                    <td>
                      <small>{Array.isArray(plan.benefits) ? plan.benefits.slice(0, 3).join(', ') : '-'}</small>
                    </td>
                    <td>
                      <span className={`admin-status-pill ${plan.is_active ? 'status-active' : 'status-expired'}`}>
                        {plan.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="plan-action-row">
                        <button type="button" onClick={() => startEdit(plan)}>Edit</button>
                        <button type="button" onClick={() => toggleActive(plan)}>
                          {plan.is_active ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function Field({ label, hint, full, children }) {
  return (
    <label className={`plan-field ${full ? 'full' : ''}`}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export default AdminMembershipPlansPage;
