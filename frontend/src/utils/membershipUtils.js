import axios from 'axios';
import API from '../api';

export const getPlanColor = (planId) => {
  if (planId === 'silver') return '#c0c0c0';
  if (planId === 'gold') return '#d4af37';
  if (planId === 'platinum') return '#7f5af0';
  return '#2f5d3a';
};

export const calculateDiscount = (amount, discountPercent) => {
  return Math.round((Number(amount || 0) * Number(discountPercent || 0)) / 100);
};

/**
 * Fetch active membership from backend.
 *
 * Fix added:
 * - Uses encodeURIComponent for email.
 * - Falls back to localStorage activeMembership so membership appears active
 *   immediately after Razorpay success, even before a full page refresh.
 */
export const getActiveMembership = async (email) => {
  if (!email) {
    return {
      hasMembership: false,
      discountPercent: 0,
      membership: null,
    };
  }

  try {
    const res = await axios.get(
      `${API}/customer/active-membership/${encodeURIComponent(email)}`
    );

    return {
      hasMembership: res.data?.hasMembership || false,
      discountPercent: Number(res.data?.discountPercent || 0),
      membership: res.data?.membership || res.data?.plan || null,
    };
  } catch (error) {
    try {
      const storedMembership = JSON.parse(localStorage.getItem('activeMembership') || 'null');

      if (storedMembership?.status === 'Active') {
        return {
          hasMembership: true,
          discountPercent: Number(storedMembership.discountPercent || 0),
          membership: storedMembership,
        };
      }
    } catch {
      // Ignore fallback error.
    }

    throw error;
  }
};
