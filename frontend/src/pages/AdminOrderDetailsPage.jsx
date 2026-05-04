import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import API from '../api';

function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const adminKey = localStorage.getItem('adminKey');

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API}/admin/orders/${id}`, {
        headers: {
          'x-admin-key': adminKey,
        },
      });

      setOrder(response.data.order || null);
      setItems(Array.isArray(response.data.items) ? response.data.items : []);
      setStatusValue(response.data.order?.status || 'Pending');
    } catch (err) {
      console.error('Admin order details fetch error:', err);

      if (err.response && err.response.status === 401) {
        localStorage.removeItem('adminKey');
        navigate('/admin/login');
        return;
      }

      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      setUpdatingStatus(true);

      await axios.put(
        `${API}/admin/orders/${id}/status`,
        { status: statusValue },
        {
          headers: {
            'x-admin-key': adminKey,
          },
        }
      );

      await fetchOrderDetails();
      alert('Order status updated successfully');
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const customerFullAddress = order
    ? `${order.address || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}`
    : '-';

  return (
    <AdminLayout
      title="Order Details"
      subtitle={`Professional admin view for order #${id}`}
      onRefresh={fetchOrderDetails}
    >
      {loading && <BoxMessage text="Loading order details..." color="#6a6157" />}
      {!loading && error && <BoxMessage text={error} color="#b42318" />}

      {!loading && !error && order && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Link
              to="/admin/orders"
              style={{
                textDecoration: 'none',
                border: '2px solid #2f5d3a',
                color: '#2f5d3a',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: '700',
                background: '#fff',
                display: 'inline-block',
              }}
            >
              ← Back To Orders
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <SummaryCard title="Order ID" value={`#${order.id}`} />
            <SummaryCard title="Grand Total" value={`₹${order.grand_total}`} />
            <SummaryCard title="Total Items" value={order.total_items} />
            <SummaryCard title="Current Status" value={<StatusPill status={order.status} large />} />
            <SummaryCard title="Payment" value={<PaymentPill order={order} large />} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 1fr',
              gap: '24px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: '#fff',
                border: '1px solid #ebe3d8',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
              }}
            >
              <h2 style={{ fontSize: '28px', color: '#171717', marginBottom: '18px' }}>
                Customer Information
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <InfoBlock label="Customer Name" value={order.full_name} />
                <InfoBlock label="Phone Number" value={order.phone} />
                <InfoBlock label="Email Address" value={order.email || '-'} />
                <InfoBlock label="Pincode" value={order.pincode || '-'} />
                <InfoBlock label="City" value={order.city || '-'} />
                <InfoBlock label="State" value={order.state || '-'} />
                <InfoBlock label="Full Address" value={customerFullAddress} fullWidth />
                <InfoBlock label="Customer Notes" value={order.notes || '-'} fullWidth />
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #ebe3d8',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                display: 'grid',
                gap: '22px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '28px', color: '#171717', marginBottom: '18px' }}>
                  Order Summary
                </h2>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <SummaryRow label="Order ID" value={`#${order.id}`} />
                  <SummaryRow label="Subtotal" value={`₹${order.subtotal}`} />
                  <SummaryRow label="Shipping" value={`₹${order.shipping}`} />
                  <SummaryRow label="Grand Total" value={`₹${order.grand_total}`} strong />
                  <SummaryRow label="Payment Type" value={order.payment_label || (order.payment_method === 'online' ? 'Prepaid / Razorpay' : 'COD / Manual')} />
                  <SummaryRow label="Payment Status" value={order.payment_status || (order.payment_method === 'online' ? 'Paid' : 'Pending')} />
                  {order.razorpay_payment_id ? (
                    <SummaryRow label="Razorpay Payment ID" value={order.razorpay_payment_id} />
                  ) : null}
                  {order.razorpay_order_id ? (
                    <SummaryRow label="Razorpay Order ID" value={order.razorpay_order_id} />
                  ) : null}
                  <SummaryRow label="Created At" value={formatDate(order.created_at)} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee3d7', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '22px', color: '#171717', marginBottom: '14px' }}>
                  Update Order Status
                </h3>

                <div style={{ marginBottom: '12px' }}>
                  <StatusPill status={order.status} />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                    style={{
                      flex: '1',
                      minWidth: '220px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #d8d0c4',
                      fontWeight: '700',
                      background: '#fff',
                    }}
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Packed</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>

                  <button
                    onClick={updateStatus}
                    disabled={updatingStatus}
                    style={{
                      border: 'none',
                      background: updatingStatus ? '#7a9c82' : '#2f5d3a',
                      color: '#fff',
                      padding: '12px 18px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      minWidth: '150px',
                    }}
                  >
                    {updatingStatus ? 'Saving...' : 'Save Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #ebe3d8',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                padding: '22px 24px',
                borderBottom: '1px solid #efe7db',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#171717' }}>
                Ordered Items
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1.5fr 130px 130px 150px',
                gap: '12px',
                padding: '18px 16px',
                background: '#efe9de',
                fontWeight: '800',
                color: '#2b2b2b',
                fontSize: '14px',
              }}
            >
              <div>Product ID</div>
              <div>Name</div>
              <div>Price</div>
              <div>Qty</div>
              <div>Line Total</div>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1.5fr 130px 130px 150px',
                  gap: '12px',
                  padding: '18px 16px',
                  borderTop: '1px solid #efe7db',
                  alignItems: 'center',
                  fontSize: '15px',
                  color: '#4f463c',
                }}
              >
                <div style={{ fontWeight: '700', color: '#2f5d3a' }}>#{item.product_id}</div>
                <div style={{ fontWeight: '700', color: '#1f1f1f', lineHeight: 1.4 }}>
                  {item.product_name}
                </div>
                <div>₹{item.price}</div>
                <div>{item.quantity}</div>
                <div style={{ fontWeight: '800', color: '#2f5d3a' }}>₹{item.line_total}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}


function PaymentPill({ order, large = false }) {
  const isOnline = order.payment_method === 'online';
  const label = order.payment_label || (isOnline ? 'Prepaid / Razorpay' : 'COD / Manual');

  return (
    <span
      style={{
        display: 'inline-block',
        padding: large ? '10px 16px' : '8px 13px',
        borderRadius: '999px',
        fontSize: large ? '14px' : '12px',
        fontWeight: '900',
        background: isOnline ? '#eaf8f0' : '#fff6e7',
        color: isOnline ? '#198754' : '#b57600',
      }}
    >
      {label}
    </span>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ebe3d8',
        borderRadius: '18px',
        padding: '18px',
      }}
    >
      <div style={{ fontSize: '14px', color: '#6b6258', marginBottom: '10px', fontWeight: '700' }}>
        {title}
      </div>
      <div style={{ fontSize: '30px', fontWeight: '900', color: '#171717', lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

function InfoBlock({ label, value, fullWidth = false }) {
  return (
    <div
      style={{
        background: '#faf8f4',
        border: '1px solid #efe7db',
        borderRadius: '14px',
        padding: '16px',
        gridColumn: fullWidth ? '1 / -1' : 'auto',
      }}
    >
      <div style={{ fontSize: '13px', color: '#7a6f63', fontWeight: '700', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '16px', color: '#1f1f1f', lineHeight: 1.6, fontWeight: '600' }}>
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        alignItems: 'flex-start',
        color: '#4f463c',
        fontSize: '16px',
      }}
    >
      <span style={{ color: '#6b6258' }}>{label}</span>
      <span style={{ fontWeight: strong ? '800' : '700', color: '#171717', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

function StatusPill({ status, large = false }) {
  const styles = {
    Pending: { bg: '#fff6e7', color: '#b57600' },
    Confirmed: { bg: '#eef9ef', color: '#2f7a32' },
    Packed: { bg: '#eef6ff', color: '#1d5fbf' },
    Shipped: { bg: '#eef3ff', color: '#375cc6' },
    Delivered: { bg: '#eaf8f0', color: '#198754' },
    Cancelled: { bg: '#fff0ef', color: '#b42318' },
  };

  const current = styles[status] || { bg: '#f4f4f4', color: '#444' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: large ? '10px 16px' : '8px 13px',
        borderRadius: '999px',
        fontSize: large ? '14px' : '12px',
        fontWeight: '800',
        background: current.bg,
        color: current.color,
      }}
    >
      {status}
    </span>
  );
}

function BoxMessage({ text, color }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '18px',
        textAlign: 'center',
        color,
        fontSize: '18px',
        border: '1px solid #ebe3d8',
      }}
    >
      {text}
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

export default AdminOrderDetailsPage;