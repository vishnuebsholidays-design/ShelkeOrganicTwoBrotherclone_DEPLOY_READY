import './AccountPage.css';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getActiveMembership } from '../utils/membershipUtils';
import API from '../api';

function AccountPage() {
  const navigate = useNavigate();
  const [customerUser, setCustomerUser] = useState(
    JSON.parse(localStorage.getItem('customerUser') || 'null')
  );
  const [membership, setMembership] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerUser) {
      navigate('/login');
      return;
    }

    loadAccountData();
  }, [customerUser?.id, customerUser?.email]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMembership(), fetchDefaultAddress(), fetchRecentOrders()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembership = async () => {
    try {
      if (!customerUser?.email) {
        setMembership(null);
        return;
      }

      const data = await getActiveMembership(customerUser.email);

      if (data?.hasMembership) {
        setMembership({
          ...data.membership,
          discountPercent: data.discountPercent,
        });
      } else {
        setMembership(null);
      }
    } catch (error) {
      console.error('Membership fetch error:', error);
      setMembership(null);
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      if (!customerUser?.id) return;
      const response = await axios.get(`${API}/users/${customerUser.id}/default-address`);
      setDefaultAddress(response.data || null);
    } catch (error) {
      console.error('Default address fetch error:', error);
      setDefaultAddress(null);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      if (!customerUser?.id) return;
      const response = await axios.get(`${API}/users/${customerUser.id}/orders`);
      const orders = Array.isArray(response.data) ? response.data : [];
      setRecentOrders(orders.slice(0, 3));
    } catch (error) {
      console.error('Orders fetch error:', error);
      setRecentOrders([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerUser');
    setCustomerUser(null);
    navigate('/login');
  };

  const fullName = customerUser?.full_name || customerUser?.name || 'Customer';
  const email = customerUser?.email || '-';
  const phone = customerUser?.phone || '-';
  const planName = membership?.plan_name || membership?.plan || 'No Active Membership';
  const discount = membership?.discountPercent || 0;

  const membershipClass = useMemo(() => {
    if (!membership) return 'normal';
    return String(planName || '').toLowerCase();
  }, [membership, planName]);

  const joinedDate = customerUser?.created_at ? formatDate(customerUser.created_at) : 'Recently joined';

  return (
    <div className={`account-page account-${membershipClass}`}>
      <Header />

      <main className="account-main">
        <section className="account-hero">
          <div>
            <span className="account-kicker">My Account</span>
            <h1>Welcome, {firstWord(fullName)}</h1>
            <p>Manage your profile, membership, orders and saved delivery address.</p>
          </div>

          <button type="button" onClick={handleLogout} className="account-logout-btn">
            Logout
          </button>
        </section>

        <section className="account-grid">
          <div className="account-profile-card">
            <div className="profile-avatar">{firstWord(fullName).charAt(0)}</div>
            <div>
              <h2>{fullName}</h2>
              <p>{email}</p>
              <p>{phone}</p>
              <span>Member since: {joinedDate}</span>
            </div>
          </div>

          <div className="account-membership-card">
            <span className="account-card-label">Membership Plan</span>
            <h2>{planName}</h2>
            {membership ? (
              <>
                <p>{discount}% discount applied on eligible orders.</p>
                <div className="membership-meta">
                  <span>Status: Active</span>
                  <span>Expiry: {formatDate(membership.expiry_date)}</span>
                </div>
              </>
            ) : (
              <>
                <p>You have no active plan. Join membership and unlock special savings.</p>
                <Link to="/membership" className="account-primary-link">View Plans</Link>
              </>
            )}
          </div>
        </section>

        <section className="account-info-grid">
          <div className="account-card">
            <div className="account-card-head">
              <div>
                <span className="account-card-label">Default Address</span>
                <h3>Delivery Details</h3>
              </div>
              <Link to="/account/addresses">Manage</Link>
            </div>

            {defaultAddress ? (
              <div className="address-box">
                <strong>{defaultAddress.full_name}</strong>
                <span>{defaultAddress.phone}</span>
                <p>{defaultAddress.address_line}</p>
                <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</p>
                {defaultAddress.landmark ? <p>Landmark: {defaultAddress.landmark}</p> : null}
              </div>
            ) : (
              <div className="empty-box">
                <p>No default address saved yet.</p>
                <Link to="/account/addresses">Add Address</Link>
              </div>
            )}
          </div>

          <div className="account-card">
            <div className="account-card-head">
              <div>
                <span className="account-card-label">Orders</span>
                <h3>Recent Orders</h3>
              </div>
              <Link to="/account/orders">View All</Link>
            </div>

            {loading ? (
              <div className="empty-box"><p>Loading details...</p></div>
            ) : recentOrders.length > 0 ? (
              <div className="recent-orders">
                {recentOrders.map((order) => (
                  <Link key={order.id} to="/account/orders" className="recent-order-row">
                    <span>#{order.id}</span>
                    <strong>₹{Number(order.grand_total || 0).toFixed(2)}</strong>
                    <em>{order.status || 'Pending'}</em>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <p>No orders found yet.</p>
                <Link to="/shop">Start Shopping</Link>
              </div>
            )}
          </div>
        </section>

        <section className="account-actions-row">
          <Link to="/shop">Shop Products</Link>
          <Link to="/cart">Go To Cart</Link>
          <Link to="/membership">Membership</Link>
          <Link to="/account/addresses">Address Book</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function firstWord(value) {
  return String(value || 'Customer').trim().split(' ')[0] || 'Customer';
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export default AccountPage;
