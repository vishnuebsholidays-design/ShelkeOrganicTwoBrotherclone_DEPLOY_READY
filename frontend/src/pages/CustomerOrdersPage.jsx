import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api';

function CustomerOrdersPage() {
  const customerUser = JSON.parse(localStorage.getItem('customerUser') || 'null');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      if (!customerUser?.id) {
        setError('Customer not logged in.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API}/users/${customerUser.id}/orders`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Customer order history error:', err);
      setError('Failed to load your order history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f6f3ee', minHeight: '100vh' }}>
      <Header />

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 64px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '46px',
              color: '#171717',
              marginBottom: '8px',
            }}
          >
            My Orders
          </h1>
          <p style={{ color: '#6b6258', fontSize: '18px', lineHeight: 1.6 }}>
            View all orders placed from your account
          </p>
        </div>

        {loading && <BoxMessage text="Loading your orders..." color="#6a6157" />}
        {!loading && error && <BoxMessage text={error} color="#b42318" />}
        {!loading && !error && orders.length === 0 && (
          <BoxMessage text="No orders found in your account." color="#6a6157" />
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
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
                    padding: '20px 24px',
                    borderBottom: '1px solid #efe7db',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#171717' }}>
                      Order #{order.id}
                    </div>
                    <div style={{ color: '#6b6258', fontSize: '15px', marginTop: '6px' }}>
                      {formatDate(order.created_at)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusPill status={order.status} />
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: '900',
                        color: '#2f5d3a',
                      }}
                    >
                      ₹{order.grand_total}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '22px 24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '16px',
                      marginBottom: '22px',
                    }}
                  >
                    <InfoCard label="Total Items" value={order.total_items} />
                    <InfoCard label="Subtotal" value={`₹${order.subtotal}`} />
                    <InfoCard label="Shipping" value={`₹${order.shipping}`} />
                  </div>

                  <div
                    style={{
                      background: '#faf8f4',
                      border: '1px solid #efe7db',
                      borderRadius: '16px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '16px 18px',
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#171717',
                        borderBottom: '1px solid #efe7db',
                      }}
                    >
                      Ordered Items
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.8fr 120px 100px 140px',
                        gap: '12px',
                        padding: '14px 16px',
                        background: '#efe9de',
                        fontWeight: '800',
                        color: '#2b2b2b',
                        fontSize: '14px',
                      }}
                    >
                      <div>Product</div>
                      <div>Price</div>
                      <div>Qty</div>
                      <div>Total</div>
                    </div>

                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.8fr 120px 100px 140px',
                          gap: '12px',
                          padding: '14px 16px',
                          borderTop: '1px solid #efe7db',
                          alignItems: 'center',
                          fontSize: '15px',
                          color: '#4f463c',
                        }}
                      >
                        <div style={{ fontWeight: '700', color: '#1f1f1f' }}>
                          {item.product_name}
                        </div>
                        <div>₹{item.price}</div>
                        <div>{item.quantity}</div>
                        <div style={{ fontWeight: '800', color: '#2f5d3a' }}>
                          ₹{item.line_total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ebe3d8',
        borderRadius: '16px',
        padding: '16px',
      }}
    >
      <div style={{ fontSize: '13px', color: '#7a6f63', fontWeight: '700', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', color: '#171717', fontWeight: '800' }}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
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
        padding: '8px 14px',
        borderRadius: '999px',
        fontSize: '13px',
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

export default CustomerOrdersPage;