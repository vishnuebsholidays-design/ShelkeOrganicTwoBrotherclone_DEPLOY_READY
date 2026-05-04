import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getActiveMembership } from '../utils/membershipUtils';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

const categories = [
  { label: 'Ghee', to: '/shop?category=Ghee', icon: '🧈' },
  { label: 'Oil', to: '/shop?category=Oil', icon: '🫒' },
  { label: 'Rice', to: '/shop?category=Rice', icon: '🍚' },
  { label: 'Atta', to: '/shop?category=Atta', icon: '🌾' },
  { label: 'Jaggery', to: '/shop?category=Jaggery', icon: '🍯' },
  { label: 'Spices', to: '/shop?category=Spices', icon: '🌶️' },
  { label: 'Immunity', to: '/shop?category=Immunity', icon: '🛡️' },
  { label: 'Breakfast & Snacks', to: '/shop?category=Snacks', icon: '🥣' },
  { label: 'Grains & Pulses', to: '/shop?category=Grains', icon: '🌱' },
];

const concerns = [
  { label: 'Diabetes', to: '/shop?concern=Diabetes' },
  { label: 'Gut Health', to: '/shop?concern=Gut Health' },
  { label: 'Immunity', to: '/shop?concern=Immunity' },
  { label: 'Weight Loss', to: '/shop?concern=Weight Loss' },
];

const farmLifeLinks = [
  { label: 'Farm Visit', to: '/farm/visit' },
  { label: 'Events', to: '/events' },
  { label: 'Quality Assurance', to: '/quality-assurance' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Our Philosophy', to: '/philosophy' },
  { label: 'Lab Reports', to: '/lab-reports' },
  { label: 'Blogs', to: '/blogs' },
];

const customerLinks = [
  { label: 'Track Order', to: '/account/orders' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Refund & Cancellation Policy', to: '/refund-policy' },
  { label: 'Shipping & Delivery Policy', to: '/shipping-policy' },
];

function Header() {
  const navigate = useNavigate();
  const accountRef = useRef(null);
  const { totalItems } = useCart();

  const [accountOpen, setAccountOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [customerUser, setCustomerUser] = useState(
    JSON.parse(localStorage.getItem('customerUser') || 'null')
  );
  const [membership, setMembership] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('All Categories');

  useEffect(() => {
    const refreshUser = () => {
      setCustomerUser(JSON.parse(localStorage.getItem('customerUser') || 'null'));
    };

    const closeAccount = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };

    window.addEventListener('storage', refreshUser);
    document.addEventListener('mousedown', closeAccount);

    return () => {
      window.removeEventListener('storage', refreshUser);
      document.removeEventListener('mousedown', closeAccount);
    };
  }, []);


  /**
   * Updates header wishlist badge from localStorage.
   *
   * Why used:
   * - Wishlist is stored client-side.
   * - Header badge updates immediately when user clicks wishlist button.
   */
  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const list = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlistCount();
    window.addEventListener('wishlist-updated', updateWishlistCount);
    window.addEventListener('storage', updateWishlistCount);

    return () => {
      window.removeEventListener('wishlist-updated', updateWishlistCount);
      window.removeEventListener('storage', updateWishlistCount);
    };
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [customerUser?.email]);

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
    } catch {
      setMembership(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerUser');
    setCustomerUser(null);
    setAccountOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchText.trim()) params.set('search', searchText.trim());
    if (category !== 'All Categories') params.set('category', category);

    navigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
    setMobileMenuOpen(false);
  };

  const toggleMenu = (menuName) => {
    setActiveMenu((current) => (current === menuName ? null : menuName));
  };

  const closeMenus = () => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
  };

  const planName = membership?.plan_name || membership?.plan || '';
  const discount = membership?.discountPercent || 0;
  const planClass = planName ? String(planName).toLowerCase() : 'normal';

  return (
    <header className={`organic-header header-${planClass}`}>
      <style>{`
        .organic-header {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #eadfd2;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 10px 30px rgba(31, 67, 38, 0.08);
        }

        .header-normal { --main:#245633; --accent:#d4af37; --pill:#fff8db; }
        .header-silver { --main:#6f7782; --accent:#c0c7d1; --pill:#eef1f5; }
        .header-gold { --main:#9a6a00; --accent:#d4af37; --pill:#fff4c6; }
        .header-platinum { --main:#4b2c83; --accent:#d4af37; --pill:#f1e6ff; }

        .offer-marquee {
          background: linear-gradient(90deg, var(--main), #2f6b40, var(--main));
          color: #fff;
          overflow: hidden;
          white-space: nowrap;
          height: 30px;
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 900;
        }

        .offer-marquee span {
          display: inline-block;
          padding-left: 100%;
          animation: moveOffer 26s linear infinite;
        }

        @keyframes moveOffer {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }

        .organic-header-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 14px 22px 0;
          position: relative;
        }

        .header-top-row {
          display: grid;
          grid-template-columns: 280px minmax(430px, 560px) auto;
          align-items: center;
          gap: 28px;
          padding-bottom: 12px;
        }

        .mobile-menu-btn {
          display: none;
          width: 39px;
          height: 39px;
          border: 0;
          background: #f6f3ee;
          color: var(--main);
          border-radius: 50%;
          font-size: 22px;
          font-weight: 900;
          cursor: pointer;
        }

        .header-search {
          display: grid;
          grid-template-columns: 1fr 170px 50px;
          height: 42px;
          border: 1px solid #e3ded6;
          background: #f7f5f1;
          overflow: hidden;
          justify-self: center;
          width: 100%;
          max-width: 560px;
          border-radius: 2px;
          transition: 0.25s ease;
        }

        .header-search:focus-within {
          border-color: var(--main);
          box-shadow: 0 10px 25px rgba(36, 86, 51, 0.12);
          background: #fff;
        }

        .header-search input,
        .header-search select {
          border: 0;
          outline: 0;
          background: transparent;
          padding: 0 12px;
          font-size: 14px;
          color: #5f5a53;
        }

        .header-search select {
          border-left: 1px solid #ddd6ce;
          cursor: pointer;
        }

        .header-search button {
          border: 0;
          background: var(--accent);
          color: #171717;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          transition: 0.22s ease;
        }

        .header-search button:hover {
          filter: brightness(0.95);
          transform: scale(1.04);
        }

        .brand-center {
          text-align: left;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 10px;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: 0.22s ease;
        }

        .brand-logo:hover {
          transform: translateY(-2px);
          filter: drop-shadow(0 8px 12px rgba(36, 86, 51, 0.18));
        }

        .brand-logo-img {
          height: 58px;
          max-width: 285px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          color: #6b6258;
          font-size: 13px;
        }

        .account-area {
          position: relative;
        }

        .account-icon-btn {
          width: 39px;
          height: 39px;
          border: 0;
          background: transparent;
          color: var(--main);
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 0;
          border-radius: 50%;
          transition: 0.18s ease;
        }

        .account-icon-btn:hover {
          background: #f6f3ee;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(36,86,51,0.12);
        }

        .account-icon-svg {
          width: 30px;
          height: 30px;
          display: block;
        }

        .login-link-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          color: var(--main);
          text-decoration: none;
          border-radius: 50%;
          transition: 0.18s ease;
        }

        .login-link-icon:hover {
          background: #f6f3ee;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(36,86,51,0.12);
        }

        .header-icon-link,
        .cart-top-link {
          width: 39px;
          height: 39px;
          text-decoration: none;
          color: var(--main);
          display: grid;
          place-items: center;
          border-radius: 50%;
          position: relative;
          transition: 0.18s ease;
        }

        .header-icon-link:hover,
        .cart-top-link:hover {
          background: #f6f3ee;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(36,86,51,0.12);
        }

        .header-svg-icon {
          width: 28px;
          height: 28px;
          display: block;
        }

        .cart-icon {
          font-size: 26px;
          line-height: 1;
          display: block;
        }

        .cart-count-badge,
        .wishlist-count-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: var(--accent);
          color: #fff;
          display: inline-grid;
          place-items: center;
          font-size: 11px;
          font-weight: 900;
          position: absolute;
          top: 1px;
          right: -2px;
          margin: 0;
          box-shadow: 0 6px 14px rgba(0,0,0,0.18);
        }

        .wishlist-count-badge {
          background: #d4af37;
          color: #171717;
        }

        .header-bottom-row {
          display: flex;
          align-items: center;
          border-top: 1px solid #f0e8df;
          min-height: 54px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0;
          height: 54px;
        }

        .nav-item {
          position: relative;
          height: 54px;
          display: flex;
          align-items: center;
        }

        .nav-link,
        .nav-button {
          text-decoration: none;
          color: #4d4944;
          font-size: 14px;
          font-weight: 900;
          padding: 17px 14px;
          border: 0;
          background: transparent;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .nav-link:hover,
        .nav-button:hover,
        .nav-item.is-active .nav-button,
        .highlight-link {
          color: var(--main) !important;
        }

        .nav-link:hover,
        .nav-button:hover {
          transform: translateY(-1px);
        }

        .menu-caret {
          font-size: 10px;
          margin-left: 4px;
        }

        .nav-item:hover .mega-menu,
        .nav-item.is-active .mega-menu {
          display: block;
          animation: megaDrop 0.22s ease forwards;
        }

        @keyframes megaDrop {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .mega-menu {
          display: none;
          position: absolute;
          left: 0;
          top: 54px;
          background: #fff;
          border: 1px solid #eadfd2;
          border-radius: 0 0 20px 20px;
          box-shadow: 0 22px 45px rgba(31, 67, 38, 0.18);
          z-index: 1000;
          overflow: hidden;
        }

        .mega-menu::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 52px;
          background: linear-gradient(180deg, rgba(225,247,231,0), rgba(199,238,208,0.95));
          pointer-events: none;
        }

        .shop-menu {
          width: min(790px, 88vw);
          padding: 28px 30px 66px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 18px 16px;
          align-items: start;
          position: relative;
          z-index: 2;
        }

        .category-menu-link {
          text-decoration: none;
          color: #2c7a4d;
          text-align: center;
          font-size: 13px;
          line-height: 1.25;
          font-weight: 900;
          padding: 8px 5px;
          border-radius: 16px;
          transition: 0.22s ease;
        }

        .category-menu-link:hover {
          background: rgba(47, 125, 78, 0.08);
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(36, 86, 51, 0.1);
        }

        .category-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 8px;
          border-radius: 50%;
          background: linear-gradient(145deg, #f8fff9, #eaf7ef);
          border: 1px solid #d6eadc;
          display: grid;
          place-items: center;
          color: #2f7d4e;
          font-size: 23px;
          box-shadow: 0 8px 18px rgba(36, 86, 51, 0.1);
          transition: 0.25s ease;
        }

        .category-menu-link:hover .category-icon {
          background: #2f7d4e;
          color: #fff;
          transform: scale(1.1) rotate(-3deg);
          box-shadow: 0 12px 24px rgba(47, 125, 78, 0.25);
        }

        .shop-all-btn {
          position: absolute;
          left: 50%;
          bottom: 20px;
          transform: translateX(-50%);
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 125px;
          height: 38px;
          border-radius: 10px;
          background: #2f7d4e;
          color: #fff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 1000;
          box-shadow: 0 10px 20px rgba(47, 125, 78, 0.22);
          transition: 0.22s ease;
        }

        .shop-all-btn:hover {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 14px 26px rgba(47, 125, 78, 0.28);
        }

        .concern-menu,
        .customers-menu,
        .farm-menu {
          width: 285px;
          padding: 18px 18px 58px;
        }

        .menu-list,
        .farm-menu-list {
          display: grid;
          gap: 10px;
          position: relative;
          z-index: 2;
        }

        .menu-list a,
        .farm-menu-list a {
          text-decoration: none;
          color: #2f7d4e;
          font-size: 13px;
          line-height: 1.25;
          font-weight: 900;
          padding: 9px 10px;
          border-radius: 10px;
          transition: 0.18s ease;
        }

        .menu-list a:hover,
        .farm-menu-list a:hover {
          background: #f3f8f1;
          transform: translateX(4px);
          box-shadow: 0 6px 14px rgba(36,86,51,0.08);
        }

        .farm-menu-list {
          grid-template-columns: 1fr 1fr;
          gap: 8px 12px;
        }

        .user-dropdown {
          position: absolute;
          right: 0;
          top: 45px;
          width: 230px;
          background: #fff;
          border: 1px solid #eadfd2;
          border-radius: 14px;
          box-shadow: 0 16px 38px rgba(0,0,0,0.14);
          padding: 10px;
          z-index: 1100;
          animation: megaDrop 0.2s ease forwards;
        }

        .user-dropdown a,
        .user-dropdown button {
          width: 100%;
          display: block;
          text-align: left;
          padding: 10px 11px;
          border-radius: 9px;
          border: 0;
          background: transparent;
          text-decoration: none;
          color: #171717;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .user-dropdown a:hover,
        .user-dropdown button:hover {
          background: #f6f3ee;
        }

        .membership-mini {
          background: var(--pill);
          border: 1px solid var(--accent);
          border-radius: 11px;
          padding: 9px;
          margin-bottom: 8px;
          font-size: 12px;
          color: var(--main);
          font-weight: 800;
        }

        .mobile-overlay {
          display: none;
        }

        .mobile-drawer {
          display: none;
        }

        @media (max-width: 980px) {
          .organic-header-inner {
            padding: 10px 12px 0;
          }

          .header-top-row {
            display: grid;
            grid-template-columns: 42px 132px 1fr auto;
            grid-template-areas:
              "menu brand search actions";
            gap: 9px;
            align-items: center;
            padding-bottom: 10px;
          }

          .mobile-menu-btn {
            display: grid;
            place-items: center;
            grid-area: menu;
          }

          .brand-center {
            grid-area: brand;
            justify-content: flex-start;
          }

          .header-search {
            grid-area: search;
            height: 37px;
            grid-template-columns: 1fr 44px;
          }

          .header-search select {
            display: none;
          }

          .header-actions {
            grid-area: actions;
            justify-content: flex-end;
            gap: 8px;
          }

          .brand-logo-img {
            height: 36px;
            max-width: 126px;
          }

          .header-bottom-row {
            display: none;
          }

          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.36);
            z-index: 1999;
            opacity: 0;
            pointer-events: none;
            transition: 0.25s ease;
          }

          .mobile-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }

          .mobile-drawer {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: min(86vw, 360px);
            background: #fff;
            z-index: 2000;
            transform: translateX(-105%);
            transition: transform 0.3s ease;
            box-shadow: 18px 0 45px rgba(0,0,0,0.22);
            overflow-y: auto;
          }

          .mobile-drawer.open {
            transform: translateX(0);
          }

          .mobile-drawer-head {
            min-height: 82px;
            background: linear-gradient(135deg, var(--main), #2f7d4e);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
          }

          .mobile-drawer-head strong {
            font-size: 17px;
          }

          .mobile-close {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.16);
            color: #fff;
            font-size: 24px;
            cursor: pointer;
          }

          .mobile-section {
            padding: 15px 16px;
            border-bottom: 1px solid #f0e8df;
          }

          .mobile-section-title {
            font-size: 12px;
            font-weight: 1000;
            color: #8a7d70;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }

          .mobile-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-decoration: none;
            color: #263c2a;
            font-weight: 900;
            padding: 11px 0;
            border-radius: 10px;
          }

          .mobile-link:hover {
            color: var(--main);
          }

          .mobile-category-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .mobile-category-link {
            text-decoration: none;
            color: #2c7a4d;
            text-align: center;
            background: #f7fbf6;
            border: 1px solid #e1efe4;
            border-radius: 14px;
            padding: 10px 6px;
            font-size: 12px;
            font-weight: 900;
          }

          .mobile-category-icon {
            display: block;
            font-size: 22px;
            margin-bottom: 5px;
          }

          .user-dropdown {
            position: fixed;
            top: 82px;
            left: 12px;
            right: 12px;
            width: auto;
            max-width: none;
          }
        }

        @media (max-width: 560px) {
          .offer-marquee {
            height: 28px;
            font-size: 11px;
          }

          .organic-header-inner {
            padding: 9px 10px 0;
          }

          .header-top-row {
            grid-template-columns: 38px 112px 1fr auto;
            gap: 7px;
          }

          .mobile-menu-btn {
            width: 35px;
            height: 35px;
            font-size: 20px;
          }

          .brand-logo-img {
            height: 34px;
            max-width: 112px;
          }

          .header-search {
            height: 36px;
          }

          .header-search input {
            padding: 0 9px;
            font-size: 12px;
          }

          .header-search button {
            font-size: 14px;
          }

          .account-icon-btn,
          .login-link-icon,
          .header-icon-link,
          .cart-top-link {
            width: 33px;
            height: 33px;
          }

          .account-icon-svg,
          .header-svg-icon {
            width: 23px;
            height: 23px;
          }

          .cart-icon {
            font-size: 22px;
          }

          .mobile-category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="offer-marquee">
        <span>
          Pure Organic Products • Free Shipping Above ₹1499 • Premium Farm Essentials •
          {membership
            ? ` ${planName} Member: ${discount}% OFF Applied • `
            : ' Join Membership & Save More • '}
          Farm Fresh Quality • Limited Period Offers •
        </span>
      </div>

      <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      <aside className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-head">
          <strong>Menu</strong>
          <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>×</button>
        </div>

        <div className="mobile-section">
          <Link to="/" className="mobile-link" onClick={closeMenus}>Home <span>›</span></Link>
          <Link to="/shop" className="mobile-link" onClick={closeMenus}>Shop All <span>›</span></Link>
          <Link to="/membership" className="mobile-link" onClick={closeMenus}>Membership <span>›</span></Link>
        </div>

        <div className="mobile-section">
          <div className="mobile-section-title">Shop By Category</div>
          <div className="mobile-category-grid">
            {categories.map((item) => (
              <Link key={item.label} to={item.to} className="mobile-category-link" onClick={closeMenus}>
                <span className="mobile-category-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mobile-section">
          <div className="mobile-section-title">Shop By Concern</div>
          {concerns.map((item) => (
            <Link key={item.label} to={item.to} className="mobile-link" onClick={closeMenus}>
              {item.label} <span>›</span>
            </Link>
          ))}
        </div>

        <div className="mobile-section">
          <div className="mobile-section-title">Farm Life</div>
          {farmLifeLinks.map((item) => (
            <Link key={item.label} to={item.to} className="mobile-link" onClick={closeMenus}>
              {item.label} <span>›</span>
            </Link>
          ))}
        </div>

        <div className="mobile-section">
          <div className="mobile-section-title">Customers</div>
          {customerLinks.map((item) => (
            <Link key={item.label} to={item.to} className="mobile-link" onClick={closeMenus}>
              {item.label} <span>›</span>
            </Link>
          ))}
        </div>
      </aside>

      <div className="organic-header-inner">
        <div className="header-top-row">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            ☰
          </button>

          <div className="brand-center">
            <Link to="/" className="brand-logo" aria-label="Shelke Organic Farms home" onClick={closeMenus}>
              <img src={logo} alt="Shelke Organic Farms" className="brand-logo-img" />
            </Link>
          </div>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All Categories</option>
              <option>Ghee</option>
              <option>Oil</option>
              <option>Atta</option>
              <option>Rice</option>
              <option>Spices</option>
              <option>Snacks</option>
              <option>Jaggery</option>
            </select>

            <button type="submit">🔍</button>
          </form>

          <div className="header-actions">
            <div className="account-area" ref={accountRef}>
              {customerUser ? (
                <>
                  <button
                    type="button"
                    className="account-icon-btn"
                    onClick={() => setAccountOpen(!accountOpen)}
                    aria-label="My Account"
                    title="My Account"
                  >
                    <svg className="account-icon-svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <circle cx="16" cy="10.5" r="5.2" stroke="currentColor" strokeWidth="2.2" />
                      <path
                        d="M6.5 27c1.7-6.2 5.2-9.3 9.5-9.3s7.8 3.1 9.5 9.3"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {accountOpen && (
                    <div className="user-dropdown">
                      {membership && (
                        <div className="membership-mini">
                          {planName} Active<br />
                          {discount}% discount applied
                        </div>
                      )}
                      <Link to="/account" onClick={() => setAccountOpen(false)}>My Account</Link>
                      <Link to="/account/orders" onClick={() => setAccountOpen(false)}>My Orders</Link>
                      <Link to="/account/addresses" onClick={() => setAccountOpen(false)}>Address Book</Link>
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="login-link-icon" aria-label="Login or Signup" title="My Account">
                  <svg className="account-icon-svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="10.5" r="5.2" stroke="currentColor" strokeWidth="2.2" />
                    <path
                      d="M6.5 27c1.7-6.2 5.2-9.3 9.5-9.3s7.8 3.1 9.5 9.3"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Link>
              )}
            </div>

            <Link to="/wishlist" className="header-icon-link" aria-label="Wishlist" title="Wishlist" onClick={closeMenus}>
              <svg className="header-svg-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                  d="M16 27s-9.5-5.7-12.4-11.2C1.2 11.2 3.8 6.7 8.6 6.7c2.7 0 4.6 1.5 5.7 3.1 1.1-1.6 3-3.1 5.7-3.1 4.8 0 7.4 4.5 5 9.1C22.1 21.3 16 27 16 27Z"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </svg>
              {wishlistCount > 0 && <span className="wishlist-count-badge">{wishlistCount}</span>}
            </Link>

            <Link to="/cart" className="cart-top-link" aria-label="Cart" title="Cart" onClick={closeMenus}>
              <span className="cart-icon">🛒</span>
              {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>

        <div className="header-bottom-row">
          <nav className="nav-links">
            <div className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMenus}>Home</Link>
            </div>

            <div
              className={`nav-item ${activeMenu === 'shop' ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveMenu('shop')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button type="button" className="nav-button" onClick={() => toggleMenu('shop')}>
                Shop <span className="menu-caret">▼</span>
              </button>
              <div className="mega-menu shop-menu">
                <div className="category-grid">
                  {categories.map((item) => (
                    <Link key={item.label} to={item.to} className="category-menu-link" onClick={closeMenus}>
                      <span className="category-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link to="/shop" className="shop-all-btn" onClick={closeMenus}>SHOP ALL</Link>
              </div>
            </div>

            <div
              className={`nav-item ${activeMenu === 'concern' ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveMenu('concern')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button type="button" className="nav-button highlight-link" onClick={() => toggleMenu('concern')}>
                Shop By Concern <span className="menu-caret">▼</span>
              </button>
              <div className="mega-menu concern-menu">
                <div className="menu-list">
                  {concerns.map((item) => (
                    <Link key={item.label} to={item.to} onClick={closeMenus}>{item.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`nav-item ${activeMenu === 'farm' ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveMenu('farm')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button type="button" className="nav-button" onClick={() => toggleMenu('farm')}>
                Farm Life <span className="menu-caret">▼</span>
              </button>
              <div className="mega-menu farm-menu">
                <div className="farm-menu-list">
                  {farmLifeLinks.map((item) => (
                    <Link key={item.label} to={item.to} onClick={closeMenus}>{item.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`nav-item ${activeMenu === 'customers' ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveMenu('customers')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button type="button" className="nav-button" onClick={() => toggleMenu('customers')}>
                Customers <span className="menu-caret">▼</span>
              </button>
              <div className="mega-menu customers-menu">
                <div className="menu-list">
                  {customerLinks.map((item) => (
                    <Link key={item.label} to={item.to} onClick={closeMenus}>{item.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="nav-item">
              <Link to="/membership" className="nav-link" onClick={closeMenus}>Membership</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;