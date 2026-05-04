import './CheckoutPage.css';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { calculateDiscount, getActiveMembership } from '../utils/membershipUtils';
import API from '../api';


function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();

  const cartItems = cart.cartItems || cart.items || [];
  const clearCart = cart.clearCart;

  const [productCatalog, setProductCatalog] = useState([]);

  const customerUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('customerUser') || 'null');
    } catch {
      return null;
    }
  }, []);

  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  const [membership, setMembership] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsLoaded, setCouponsLoaded] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const membershipDiscount = calculateDiscount(subtotal, discountPercent);
  const afterMembershipTotal = Math.max(0, subtotal - membershipDiscount);
  const afterCouponTotal = Math.max(0, afterMembershipTotal - couponDiscount);
  const shipping = afterCouponTotal >= 1499 || afterCouponTotal === 0 ? 0 : 99;
  const grandTotal = afterCouponTotal + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  useEffect(() => {
    fetchProductCatalog();
  }, []);

  const fetchProductCatalog = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProductCatalog(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Product catalog fetch error:', err);
      setProductCatalog([]);
    }
  };

  const getProductFromCatalog = (item) => {
    return productCatalog.find((p) => Number(p.id) === Number(item.id || item.product_id || item.productId));
  };

  const getCartItemsForCoupon = () => {
    return cartItems.map((item) => {
      const product = getProductFromCatalog(item);

      return {
        ...item,
        id: item.id || item.product_id || item.productId,
        product_id: item.product_id || item.id || item.productId,
        name: item.name || product?.name || '',
        price: Number(item.price || product?.price || 0),
        quantity: Number(item.quantity || 1),
        category:
          item.category ||
          item.product_category ||
          item.productCategory ||
          product?.category ||
          '',
      };
    });
  };

  useEffect(() => {
    if (customerUser) {
      setCustomer((prev) => ({
        ...prev,
        fullName: customerUser.full_name || '',
        email: customerUser.email || '',
        phone: customerUser.phone || '',
      }));

      fetchMembership(customerUser.email);
      fetchDefaultAddress(customerUser.id);
    }
  }, [customerUser?.id, customerUser?.email]);

  useEffect(() => {
    if (appliedCoupon) {
      removeCoupon(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, membershipDiscount]);

  const fetchMembership = async (email) => {
    try {
      const data = await getActiveMembership(email);

      if (data.hasMembership) {
        setMembership(data.membership || data.plan);
        setDiscountPercent(data.discountPercent);
      } else {
        setMembership(null);
        setDiscountPercent(0);
      }
    } catch {
      setMembership(null);
      setDiscountPercent(0);
    }
  };

  const fetchDefaultAddress = async (userId) => {
    if (!userId) return;

    try {
      const res = await axios.get(`${API}/users/${userId}/default-address`);

      if (res.data) {
        setCustomer((prev) => ({
          ...prev,
          fullName: res.data.full_name || prev.fullName,
          phone: res.data.phone || prev.phone,
          address: res.data.address_line || '',
          city: res.data.city || '',
          state: res.data.state || '',
          pincode: res.data.pincode || '',
        }));
      }
    } catch (err) {
      console.error('Default address fetch error:', err);
    }
  };

  const fetchCurrentLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Location is not supported in this browser.');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await axios.get(`${API}/location/reverse-geocode`, {
            params: { lat: latitude, lon: longitude },
          });

          setCustomer((prev) => ({
            ...prev,
            address: res.data.addressLine || res.data.fullAddress || prev.address,
            city: res.data.city || prev.city,
            state: res.data.state || prev.state,
            pincode: res.data.pincode || prev.pincode,
          }));
        } catch (err) {
          console.error('Location fetch error:', err);
          setError('Failed to fetch location address. Please enter address manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setError('Location permission denied. Please allow location or enter address manually.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const normalizeText = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');

  const normalizeCoupon = (coupon) => ({
    ...coupon,
    code: String(coupon.code || '').toUpperCase(),
    value: Number(coupon.value || 0),
    min_order: Number(coupon.min_order || 0),
    max_discount: Number(coupon.max_discount || 0),
    product_id: coupon.product_id ? String(coupon.product_id) : '',
    category: coupon.category ? String(coupon.category) : '',
    is_active: coupon.is_active === 1 || coupon.is_active === true || coupon.is_active === '1',
  });

  const isCouponExpired = (coupon) => {
    if (!coupon.expiry_date) return false;
    const expiry = new Date(String(coupon.expiry_date).slice(0, 10));
    expiry.setHours(23, 59, 59, 999);
    return expiry < new Date();
  };

  const getCouponCheck = (coupon) => {
    const c = normalizeCoupon(coupon);
    const couponCartItems = getCartItemsForCoupon();

    if (!c.is_active) {
      return { valid: false, reason: 'Inactive coupon' };
    }

    if (isCouponExpired(c)) {
      return { valid: false, reason: 'Coupon expired' };
    }

    if (c.min_order && afterMembershipTotal < c.min_order) {
      return { valid: false, reason: `Minimum order ₹${c.min_order}` };
    }

    if (c.product_id) {
      const hasProduct = couponCartItems.some(
        (item) => String(item.id || item.product_id || item.productId) === String(c.product_id)
      );

      if (!hasProduct) {
        return { valid: false, reason: `Valid for Product #${c.product_id}` };
      }
    }

    if (c.category) {
      const couponCategory = normalizeText(c.category);

      const hasCategory = couponCartItems.some((item) => {
        const itemCategory = normalizeText(item.category);
        return (
          itemCategory &&
          (itemCategory === couponCategory ||
            itemCategory.includes(couponCategory) ||
            couponCategory.includes(itemCategory))
        );
      });

      if (!hasCategory) {
        return { valid: false, reason: `Valid for ${c.category} category` };
      }
    }

    return { valid: true, reason: c.category ? `Valid for ${c.category} category` : 'Applicable on this cart' };
  };

  const loadAvailableCoupons = async () => {
    try {
      setShowCoupons((prev) => !prev);

      if (couponsLoaded) return;

      setCouponsLoading(true);
      setCouponMessage('');

      let res;
      try {
        res = await axios.get(`${API}/coupons`);
      } catch {
        const adminKey = localStorage.getItem('adminKey') || '';
        res = await axios.get(`${API}/admin/coupons`, {
          headers: adminKey ? { 'x-admin-key': adminKey } : {},
        });
      }

      const list = Array.isArray(res.data) ? res.data : res.data?.coupons || [];
      setAvailableCoupons(list.map(normalizeCoupon));
      setCouponsLoaded(true);
    } catch (err) {
      console.error('Available coupons load error:', err);
      setCouponMessage('Unable to load available coupons. Please enter coupon code manually.');
    } finally {
      setCouponsLoading(false);
    }
  };

  const applyCoupon = async (manualCode = '') => {
    const code = String(manualCode || couponCode).trim().toUpperCase();

    if (!code) {
      setCouponMessage('Please enter coupon code.');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage('');
      setError('');

      const res = await axios.post(`${API}/apply-coupon`, {
        code,
        cartTotal: afterMembershipTotal,
        products: getCartItemsForCoupon(),
      });

      if (!res.data?.success) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage(res.data?.message || 'Coupon not applicable.');
        return;
      }

      setAppliedCoupon(res.data.coupon || { code: res.data.couponCode || code });
      setCouponDiscount(Number(res.data.discount || 0));
      setCouponCode(code);
      setCouponMessage(res.data.message || 'Coupon applied successfully.');
    } catch (err) {
      console.error('Coupon apply error:', err);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponMessage(err.response?.data?.message || 'Coupon apply failed.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = (showMessage = true) => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    if (showMessage) {
      setCouponCode('');
      setCouponMessage('Coupon removed.');
    } else {
      setCouponMessage('');
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const validateForm = () => {
    if (!customerUser?.id) {
      setShowLoginPopup(true);
      setError('Please login before placing your order.');
      return false;
    }

    if (!cartItems.length) {
      setError('Your cart is empty.');
      return false;
    }

    if (
      !customer.fullName ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.state ||
      !customer.pincode
    ) {
      setError('Please fill all required delivery details.');
      return false;
    }

    return true;
  };

  const saveOrder = async (paymentData = {}) => {
    const payload = {
      userId: customerUser?.id || null,
      customer,
      items: getCartItemsForCoupon(),
      totalItems,
      subtotal,
      membershipDiscount,
      discountPercent,
      couponCode: appliedCoupon?.code || '',
      couponDiscount,
      shipping,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'Paid' : 'Pending',
      razorpayOrderId: paymentData.razorpay_order_id || '',
      razorpayPaymentId: paymentData.razorpay_payment_id || '',
      membershipPlan: membership?.plan_name || '',
    };

    const res = await axios.post(`${API}/orders`, payload);

    if (res.data?.success) {
      const orderId = res.data.orderId;

      if (clearCart) {
        clearCart();
      }

      navigate(`/thank-you?orderId=${orderId}`);
      return;
    }

    throw new Error('Order save failed');
  };

  const handleOnlinePayment = async () => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      setError('Razorpay failed to load. Please check internet connection.');
      return;
    }

    let orderRes;

    try {
      orderRes = await axios.post(`${API}/payment/create-order`, {
        amount: grandTotal,
        receipt: `shelke_${Date.now()}`,
      });
    } catch (err) {
      console.error('Razorpay order create error:', err.response?.data || err);
      setLoading(false);
      setError(
        err.response?.data?.details ||
          err.response?.data?.error ||
          'Failed to create Razorpay order. Please check backend Razorpay keys and server.'
      );
      return;
    }

    const { key, order } = orderRes.data;

    if (!key || !order?.id) {
      setLoading(false);
      setError('Razorpay order response is invalid. Please check backend configuration.');
      return;
    }

    const options = {
      key,
      amount: order.amount,
      currency: order.currency,
      name: 'Shelke Organic',
      description: 'Organic product order payment',
      order_id: order.id,
      prefill: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: '#2f5d3a' },
      handler: async function (response) {
        try {
          setLoading(true);
          setError('');

          const verifyRes = await axios.post(`${API}/payment/verify`, response);

          if (!verifyRes.data?.success) {
            setError('Payment verification failed.');
            return;
          }

          await saveOrder(response);
        } catch (err) {
          console.error('Payment verification/save error:', err);
          setError('Payment successful, but order save failed. Please contact admin.');
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          setError('Payment cancelled by customer.');
        },
      },
    };

    const razorpayCheckout = new window.Razorpay(options);

    razorpayCheckout.on('payment.failed', function (response) {
      console.error('Razorpay payment failed:', response.error);
      setLoading(false);
      setError(response.error?.description || 'Payment failed. Please try again.');
    });

    razorpayCheckout.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      if (!validateForm()) return;

      if (paymentMethod === 'online') {
        await handleOnlinePayment();
        return;
      }

      await saveOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order.');
    } finally {
      if (paymentMethod !== 'online') {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="checkout-page">
      <Header />

      <main className="checkout-main">
        <div className="checkout-container">
          <div className="checkout-head">
            <p>Secure Checkout</p>
            <h1>Complete Your Order</h1>
            <span>Membership discount and admin coupons are applied safely.</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="checkout-empty">
              <h2>Your cart is empty</h2>
              <Link to="/shop">Back To Shop</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="checkout-layout">
              <section className="checkout-card">
                <div className="checkout-card-head">
                  <h2>Delivery Details</h2>
                  <button type="button" onClick={fetchCurrentLocation} className="location-btn">
                    {locationLoading ? 'Fetching...' : 'Use Current Location'}
                  </button>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <div className="checkout-grid">
                  <div className="checkout-field">
                    <label>Full Name *</label>
                    <input name="fullName" value={customer.fullName} onChange={handleChange} />
                  </div>

                  <div className="checkout-field">
                    <label>Phone *</label>
                    <input name="phone" value={customer.phone} onChange={handleChange} />
                  </div>

                  <div className="checkout-field full">
                    <label>Email</label>
                    <input name="email" value={customer.email} onChange={handleChange} />
                  </div>

                  <div className="checkout-field full">
                    <label>Address *</label>
                    <textarea name="address" value={customer.address} onChange={handleChange} />
                  </div>

                  <div className="checkout-field">
                    <label>City *</label>
                    <input name="city" value={customer.city} onChange={handleChange} />
                  </div>

                  <div className="checkout-field">
                    <label>State *</label>
                    <input name="state" value={customer.state} onChange={handleChange} />
                  </div>

                  <div className="checkout-field">
                    <label>Pincode *</label>
                    <input name="pincode" value={customer.pincode} onChange={handleChange} />
                  </div>

                  <div className="checkout-field full">
                    <label>Order Notes</label>
                    <textarea
                      name="notes"
                      value={customer.notes}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <h2 className="payment-title">Payment</h2>

                <div className="payment-options">
                  <label className={paymentMethod === 'cod' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div>
                      <strong>Manual Payment</strong>
                      <span>Admin will verify payment.</span>
                    </div>
                  </label>

                  <label className={paymentMethod === 'online' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div>
                      <strong>Razorpay Online</strong>
                      <span>UPI, card, netbanking, wallet.</span>
                    </div>
                  </label>
                </div>
              </section>

              <aside className="checkout-summary">
                <h2>Order Summary</h2>

                <div className="checkout-items">
                  {cartItems.map((item) => (
                    <div className="checkout-item" key={`${item.id}-${item.name}`}>
                      <span>
                        {item.name} × {item.quantity || 1}
                      </span>
                      <strong>
                        ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                {membership && (
                  <div className="checkout-member-box">
                    <strong>{membership.plan_name} Active</strong>
                    <span>{discountPercent}% discount applied</span>
                  </div>
                )}

                <div className="checkout-coupon-box">
                  <div className="checkout-coupon-head">
                    <label>Apply Coupon</label>
                    <button type="button" className="view-coupons-btn" onClick={loadAvailableCoupons}>
                      {showCoupons ? 'Hide Coupons' : 'View All Coupons'}
                    </button>
                  </div>

                  <div className="checkout-coupon-row">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      disabled={!!appliedCoupon || couponLoading}
                    />

                    {appliedCoupon ? (
                      <button type="button" onClick={() => removeCoupon(true)}>
                        Remove
                      </button>
                    ) : (
                      <button type="button" onClick={() => applyCoupon()} disabled={couponLoading}>
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>

                  {showCoupons && (
                    <div className="available-coupons-panel">
                      {couponsLoading ? (
                        <p className="coupon-small-text">Loading coupons...</p>
                      ) : availableCoupons.length === 0 ? (
                        <p className="coupon-small-text">No coupons available right now.</p>
                      ) : (
                        availableCoupons.map((coupon) => {
                          const check = getCouponCheck(coupon);

                          return (
                            <div
                              className={`available-coupon ${check.valid ? 'is-valid' : 'is-disabled'}`}
                              key={coupon.id || coupon.code}
                            >
                              <div>
                                <strong>{coupon.code}</strong>
                                <span>
                                  {coupon.type === 'percentage'
                                    ? `${coupon.value}% OFF${coupon.max_discount ? ` up to ₹${coupon.max_discount}` : ''}`
                                    : `₹${coupon.value} OFF`}
                                </span>
                                <small>{check.reason}</small>
                              </div>

                              <button
                                type="button"
                                disabled={!check.valid || !!appliedCoupon || couponLoading}
                                onClick={() => {
                                  setCouponCode(coupon.code);
                                  applyCoupon(coupon.code);
                                }}
                              >
                                Apply
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {couponMessage && (
                    <p className={appliedCoupon ? 'coupon-success' : 'coupon-error'}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                <div className="checkout-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>

                <div className="checkout-row discount">
                  <span>Membership Discount</span>
                  <strong>- ₹{membershipDiscount.toFixed(2)}</strong>
                </div>

                <div className="checkout-row discount">
                  <span>Coupon Discount</span>
                  <strong>- ₹{couponDiscount.toFixed(2)}</strong>
                </div>

                <div className="checkout-row">
                  <span>Shipping</span>
                  <strong>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</strong>
                </div>

                <div className="checkout-divider" />

                <div className="checkout-row total">
                  <span>Total</span>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>

                <button className="place-order-btn" type="submit" disabled={loading}>
                  {loading
                    ? 'Processing...'
                    : paymentMethod === 'online'
                      ? `Pay ₹${grandTotal.toFixed(2)}`
                      : 'Place Order'}
                </button>
              </aside>
            </form>
          )}
        </div>
      </main>

      {showLoginPopup && (
        <div className="checkout-login-overlay" role="dialog" aria-modal="true">
          <div className="checkout-login-popup">
            <button
              type="button"
              className="checkout-login-close"
              onClick={() => setShowLoginPopup(false)}
              aria-label="Close login popup"
            >
              ×
            </button>

            <span className="checkout-login-icon">👤</span>
            <h2>Login Required</h2>
            <p>Please login before placing your order or making payment.</p>

            <button
              type="button"
              className="checkout-login-primary"
              onClick={() => navigate('/login', { state: { from: '/checkout' } })}
            >
              Login Now
            </button>

            <button
              type="button"
              className="checkout-login-secondary"
              onClick={() => setShowLoginPopup(false)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default CheckoutPage;