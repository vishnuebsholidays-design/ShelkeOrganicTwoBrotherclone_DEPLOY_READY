import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api';

function AddressBookPage() {
  const customerUser = JSON.parse(localStorage.getItem('customerUser') || 'null');

  const emptyForm = {
    fullName: customerUser?.full_name || '',
    phone: customerUser?.phone || '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home',
    isDefault: true,
  };

  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API}/users/${customerUser.id}/addresses`);
      const data = Array.isArray(response.data) ? response.data : [];
      setAddresses(data);

      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          isDefault: false,
        }));
      }
    } catch (err) {
      console.error('Address fetch error:', err);
      setError('Failed to load address book');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });
    setEditingId(null);
    setMessage('');
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      fullName: address.full_name || '',
      phone: address.phone || '',
      addressLine: address.address_line || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      landmark: address.landmark || '',
      addressType: address.address_type || 'Home',
      isDefault: !!address.is_default,
    });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage('');
      setError('');

      if (editingId) {
        await axios.put(
          `${API}/users/${customerUser.id}/addresses/${editingId}`,
          formData
        );
        setMessage('Address updated successfully');
      } else {
        await axios.post(`${API}/users/${customerUser.id}/addresses`, formData);
        setMessage('Address added successfully');
      }

      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error('Address save error:', err);
      setError(err.response?.data?.error || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm('Delete this address?');
    if (!confirmed) return;

    try {
      await axios.delete(`${API}/users/${customerUser.id}/addresses/${addressId}`);
      setMessage('Address deleted successfully');
      fetchAddresses();
    } catch (err) {
      console.error('Delete address error:', err);
      setError(err.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.put(`${API}/users/${customerUser.id}/addresses/${addressId}/default`);
      setMessage('Default address updated');
      fetchAddresses();
    } catch (err) {
      console.error('Set default error:', err);
      setError(err.response?.data?.error || 'Failed to set default address');
    }
  };

  return (
    <div style={{ background: '#f6f3ee', minHeight: '100vh' }}>
      <Header />

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 64px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '48px', margin: 0, color: '#171717' }}>Address Book</h1>
          <p style={{ marginTop: '10px', color: '#6b6258', fontSize: '18px' }}>
            Save multiple addresses and auto-fill checkout with your default address
          </p>
        </div>

        {message && <MessageBox text={message} color="#198754" bg="#eef9ef" />}
        {error && <MessageBox text={error} color="#b42318" bg="#fff0ef" />}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <div style={cardStyle}>
            <h2 style={sectionTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" style={inputStyle} />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" style={inputStyle} />
              <textarea name="addressLine" value={formData.addressLine} onChange={handleChange} placeholder="Full Address" style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }} />
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City" style={inputStyle} />
              <input name="state" value={formData.state} onChange={handleChange} placeholder="State" style={inputStyle} />
              <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" style={inputStyle} />
              <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" style={inputStyle} />

              <select name="addressType" value={formData.addressType} onChange={handleChange} style={inputStyle}>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#3c352e' }}>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                Set as default address
              </label>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="submit" disabled={saving} style={primaryBtn}>
                  {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                </button>

                {editingId && (
                  <button type="button" onClick={resetForm} style={secondaryBtn}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitle}>Saved Addresses</h2>

            {loading ? (
              <div style={smallBox}>Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div style={smallBox}>No addresses saved yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {addresses.map((address) => (
                  <div key={address.id} style={addressCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#171717' }}>
                          {address.full_name}
                        </div>
                        <div style={{ color: '#6b6258', marginTop: '4px', fontWeight: '700' }}>
                          {address.address_type}
                          {address.is_default ? ' • Default' : ''}
                        </div>
                      </div>

                      {address.is_default && (
                        <span style={defaultPill}>Default</span>
                      )}
                    </div>

                    <div style={{ marginTop: '14px', color: '#4f463c', lineHeight: 1.7 }}>
                      <div>{address.phone}</div>
                      <div>{address.address_line}</div>
                      <div>
                        {address.city}, {address.state} - {address.pincode}
                      </div>
                      {address.landmark ? <div>Landmark: {address.landmark}</div> : null}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                      <button onClick={() => handleEdit(address)} style={tinyBtn}>
                        Edit
                      </button>

                      {!address.is_default && (
                        <button onClick={() => handleSetDefault(address.id)} style={tinyBtnOutline}>
                          Set Default
                        </button>
                      )}

                      <button onClick={() => handleDelete(address.id)} style={deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MessageBox({ text, color, bg }) {
  return (
    <div
      style={{
        marginBottom: '18px',
        padding: '14px 16px',
        borderRadius: '12px',
        fontWeight: '800',
        background: bg,
        color,
      }}
    >
      {text}
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  border: '1px solid #ebe3d8',
  borderRadius: '22px',
  padding: '24px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
};

const sectionTitle = {
  margin: '0 0 18px',
  fontSize: '28px',
  color: '#171717',
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid #ddd5c9',
  fontSize: '16px',
  outline: 'none',
  background: '#fff',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const primaryBtn = {
  border: 'none',
  background: '#2f5d3a',
  color: '#fff',
  padding: '14px 20px',
  borderRadius: '12px',
  fontWeight: '800',
  cursor: 'pointer',
};

const secondaryBtn = {
  border: '2px solid #2f5d3a',
  background: '#fff',
  color: '#2f5d3a',
  padding: '12px 18px',
  borderRadius: '12px',
  fontWeight: '800',
  cursor: 'pointer',
};

const tinyBtn = {
  border: 'none',
  background: '#2f5d3a',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: '10px',
  fontWeight: '800',
  cursor: 'pointer',
};

const tinyBtnOutline = {
  border: '2px solid #2f5d3a',
  background: '#fff',
  color: '#2f5d3a',
  padding: '8px 12px',
  borderRadius: '10px',
  fontWeight: '800',
  cursor: 'pointer',
};

const deleteBtn = {
  border: 'none',
  background: '#fff0ef',
  color: '#b42318',
  padding: '10px 14px',
  borderRadius: '10px',
  fontWeight: '800',
  cursor: 'pointer',
};

const smallBox = {
  background: '#faf8f4',
  border: '1px solid #efe7db',
  borderRadius: '14px',
  padding: '18px',
  color: '#6b6258',
};

const addressCard = {
  background: '#faf8f4',
  border: '1px solid #efe7db',
  borderRadius: '16px',
  padding: '18px',
};

const defaultPill = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#eef9ef',
  color: '#198754',
  fontWeight: '800',
  fontSize: '13px',
};

export default AddressBookPage;