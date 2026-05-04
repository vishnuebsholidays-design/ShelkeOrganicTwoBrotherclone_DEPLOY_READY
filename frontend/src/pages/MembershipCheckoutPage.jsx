import './MembershipCheckoutPage.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api';


function MembershipCheckoutPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const customerUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('customerUser') || 'null');
    } catch {
      return null;
    }
  }, []);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: customerUser?.full_name || customerUser?.name || '',
    email: customerUser?.email || '',
    phone: customerUser?.phone || customerUser?.mobile || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [autoLocationTried, setAutoLocationTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const gst = 0;
  const total = Number(selectedPlan?.price || 0) + gst;

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setPlanLoading(true);
        const res = await axios.get(`${API}/membership-plans`);
        const plans = Array.isArray(res.data) ? res.data : [];
        const found = plans.find((plan) => String(plan.plan_key) === String(planId));
        if (!found) {
          setError('Selected membership plan is not available. Please select another plan.');
          return;
        }
        setSelectedPlan(found);
      } catch (err) {
        console.error('Membership plan fetch error:', err);
        setError('Failed to load membership plan. Please check backend server.');
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  useEffect(() => {
    if (!customerUser) {
      navigate('/login', { state: { from: `/membership/checkout/${planId}` } });
    }
  }, [customerUser, navigate, planId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!selectedPlan) {
      setError('Membership plan not found.');
      return false;
    }

    if (!formData.fullName || !formData.phone || !formData.email || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill all required customer and address details.');
      return false;
    }

    return true;
  };

  const fetchCurrentLocation = useCallback((silent = false) => {
    setError('');
    setLocationMessage('');

    if (!navigator.geolocation) {
      if (!silent) setError('Location is not supported in this browser.');
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

          setFormData((prev) => ({
            ...prev,
            address: res.data.addressLine || res.data.fullAddress || prev.address,
            city: res.data.city || prev.city,
            state: res.data.state || prev.state,
            pincode: res.data.pincode || prev.pincode,
          }));

          setLocationMessage('Location fetched successfully.');
        } catch (err) {
          console.error('Location fetch error:', err);
          if (!silent) setError('Failed to fetch location address. Please enter address manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        if (!silent) setError('Location permission denied. Please allow location or enter address manually.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (autoLocationTried) return;
    const hasAddress = formData.address || formData.city || formData.state || formData.pincode;
    if (!hasAddress) {
      setAutoLocationTried(true);
      fetchCurrentLocation(true);
    }
  }, [autoLocationTried, fetchCurrentLocation, formData.address, formData.city, formData.pincode, formData.state]);

  const saveMembershipRequest = async (paymentData = {}) => {
    const payload = {
      customer_id: customerUser?.id || null,
      plan_id: selectedPlan.plan_key,
      plan_name: selectedPlan.name,
      amount: Number(selectedPlan.price || 0),
      gst,
      total,
      validity: `${selectedPlan.duration_months || 12} Months`,
      duration_months: Number(selectedPlan.duration_months || 12),
      discount_percent: Number(selectedPlan.discount_percent || 0),
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      payment_method: 'online',
      payment_status: 'Paid',
      razorpay_order_id: paymentData.razorpay_order_id || '',
      razorpay_payment_id: paymentData.razorpay_payment_id || '',
      razorpay_signature: paymentData.razorpay_signature || '',
      notes: formData.notes,
    };

    await axios.post(`${API}/memberships`, payload);
    setShowSuccessPopup(true);
  };

  const handleOnlinePayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Razorpay failed to load. Please check internet connection.');
      return;
    }

    const orderRes = await axios.post(`${API}/payment/create-order`, {
      amount: total,
      receipt: `membership_${selectedPlan.plan_key}_${Date.now()}`,
    });

    const { key, order } = orderRes.data;

    const options = {
      key,
      amount: order.amount,
      currency: order.currency,
      name: 'Shelke Organic',
      description: `${selectedPlan.name} Membership Payment`,
      order_id: order.id,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: '#2f5d3a' },
      handler: async function (response) {
        try {
          setSubmitting(true);
          setError('');
          const verifyRes = await axios.post(`${API}/payment/verify`, response);
          if (!verifyRes.data?.success) {
            setError('Payment verification failed.');
            return;
          }
          await saveMembershipRequest(response);
        } catch (err) {
          console.error('Membership payment save error:', err);
          setError('Payment successful, but membership activation failed. Please contact admin.');
        } finally {
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: function () {
          setSubmitting(false);
          setError('Payment cancelled by customer.');
        },
      },
    };

    const razorpayCheckout = new window.Razorpay(options);
    razorpayCheckout.on('payment.failed', function (response) {
      console.error('Razorpay payment failed:', response.error);
      setSubmitting(false);
      setError(response.error?.description || 'Payment failed. Please try again.');
    });
    razorpayCheckout.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (!validateForm()) return;
      await handleOnlinePayment();
    } catch (err) {
      console.error('Membership submit error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to start Razorpay payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = Array.isArray(selectedPlan?.benefits) ? selectedPlan.benefits : [];

  return (
    <div className="membership-checkout-page">
      <Header />

      <section className="membership-checkout-hero">
        <div className="membership-checkout-container">
          <div className="membership-checkout-hero__top">
            <div>
              <div className="membership-checkout-hero__eyebrow">Secure Razorpay Membership Checkout</div>
              <h1 className="membership-checkout-hero__title">Complete Membership Purchase</h1>
              <p className="membership-checkout-hero__subtitle">
                Manual payment is removed. Membership activates automatically after successful Razorpay payment.
              </p>
            </div>
            <Link to="/membership" className="membership-checkout-back-btn">Back To Plans</Link>
          </div>
        </div>
      </section>

      <section className="membership-checkout-main">
        <div className="membership-checkout-container">
          {planLoading ? <div className="membership-checkout-card">Loading membership plan...</div> : null}

          <form className="membership-checkout-layout" onSubmit={handleSubmit}>
            <div className="membership-checkout-left">
              <div className="membership-checkout-card">
                <div className="membership-checkout-card-head">
                  <h2 className="membership-checkout-card__title">Customer Details</h2>
                  <button type="button" onClick={() => fetchCurrentLocation(false)} className="membership-location-btn" disabled={locationLoading}>
                    {locationLoading ? 'Fetching...' : 'Use Current Location'}
                  </button>
                </div>

                {error && <div className="membership-error-box">{error}</div>}
                {locationMessage && <div className="membership-success-box">{locationMessage}</div>}

                <div className="membership-form-grid">
                  <div className="membership-field"><label>Full Name *</label><input name="fullName" value={formData.fullName} onChange={handleChange} required /></div>
                  <div className="membership-field"><label>Phone Number *</label><input name="phone" value={formData.phone} onChange={handleChange} required /></div>
                  <div className="membership-field membership-field--full"><label>Email Address *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                  <div className="membership-field membership-field--full"><label>Address *</label><textarea name="address" rows="3" value={formData.address} onChange={handleChange} required /></div>
                  <div className="membership-field"><label>City *</label><input name="city" value={formData.city} onChange={handleChange} required /></div>
                  <div className="membership-field"><label>State *</label><input name="state" value={formData.state} onChange={handleChange} required /></div>
                  <div className="membership-field"><label>Pincode *</label><input name="pincode" value={formData.pincode} onChange={handleChange} required /></div>
                  <div className="membership-field membership-field--full"><label>Notes</label><textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Optional" /></div>
                </div>
              </div>

              <div className="membership-checkout-card">
                <h2 className="membership-checkout-card__title">Payment Method</h2>
                <div className="membership-payment-options">
                  <label className="membership-payment-option active">
                    <input type="radio" checked readOnly />
                    <div>
                      <strong>Razorpay Online Payment Only</strong>
                      <p>Pay securely by UPI, card, netbanking or wallet. Membership will activate instantly after payment success.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="membership-summary-card">
              <div className="membership-summary-badge">{selectedPlan?.name || 'Plan'}</div>
              <h2>{selectedPlan?.name || 'Membership'} Membership</h2>
              <p className="membership-summary-subtitle">Validity: {selectedPlan?.duration_months || 12} Months</p>
              <div className="membership-summary-price">₹{Number(selectedPlan?.price || 0)}</div>

              <div className="membership-summary-benefits">
                {benefits.map((benefit) => <div key={benefit} className="membership-summary-benefit">✓ {benefit}</div>)}
              </div>

              <div className="membership-summary-divider" />
              <div className="membership-summary-row"><span>Plan Amount</span><span>₹{Number(selectedPlan?.price || 0)}</span></div>
              <div className="membership-summary-row"><span>GST / Charges</span><span>₹{gst}</span></div>
              <div className="membership-summary-row total"><span>Total</span><span>₹{total}</span></div>

              <button type="submit" className="membership-place-btn" disabled={submitting || planLoading || !selectedPlan}>
                {submitting ? 'Processing...' : `Pay ₹${total} & Activate`}
              </button>

              <p className="membership-summary-note">No admin confirmation required after successful Razorpay payment.</p>
            </div>
          </form>
        </div>
      </section>

      {showSuccessPopup ? (
        <div className="membership-success-overlay">
          <div className="membership-success-modal">
            <div className="membership-success-icon">✓</div>
            <h2>Congratulations!</h2>
            <p>Your {selectedPlan?.name} membership is activated successfully.</p>
            <button type="button" onClick={() => navigate('/membership')}>Continue</button>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}

export default MembershipCheckoutPage;
