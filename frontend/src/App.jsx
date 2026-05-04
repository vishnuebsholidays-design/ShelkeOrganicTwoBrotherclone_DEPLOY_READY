import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AccountPage from './pages/AccountPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import AddressBookPage from './pages/AddressBookPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminMembershipsPage from './pages/AdminMembershipsPage';
import AdminMembershipPlansPage from './pages/AdminMembershipPlansPage';
import AdminVideosPage from './pages/AdminVideosPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedUserRoute from './components/ProtectedUserRoute';
import MembershipPage from './pages/MembershipPage';
import MembershipCheckoutPage from './pages/MembershipCheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import FarmVisitPage from './pages/FarmVisitPage';
import QualityAssurancePage from './pages/QualityAssurancePage';
import BlogsPage from './pages/BlogsPage';
import WishlistPage from './pages/WishlistPage';

/**
 * App Routes
 *
 * Functionality:
 * - Keeps all existing customer/admin routes.
 * - Adds /wishlist route so header wishlist icon opens saved products list.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/farm/visit" element={<FarmVisitPage />} />
      <Route path="/quality-assurance" element={<QualityAssurancePage />} />
      <Route path="/blogs" element={<BlogsPage />} />

      <Route path="/membership" element={<MembershipPage />} />
      <Route path="/membership/checkout/:planId" element={<MembershipCheckoutPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      <Route
        path="/membership/success"
        element={
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <h1>Membership Request Submitted</h1>
            <p>
              Your membership request has been received. Admin will activate it after
              confirmation.
            </p>
            <a href="/membership">Back to Membership</a>
          </div>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedUserRoute>
            <AccountPage />
          </ProtectedUserRoute>
        }
      />

      <Route
        path="/account/orders"
        element={
          <ProtectedUserRoute>
            <CustomerOrdersPage />
          </ProtectedUserRoute>
        }
      />

      <Route
        path="/account/addresses"
        element={
          <ProtectedUserRoute>
            <AddressBookPage />
          </ProtectedUserRoute>
        }
      />

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route
        path="/admin/orders"
        element={
          <ProtectedAdminRoute>
            <AdminOrdersPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/orders/:id"
        element={
          <ProtectedAdminRoute>
            <AdminOrderDetailsPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/products"
        element={
          <ProtectedAdminRoute>
            <AdminProductsPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/memberships"
        element={
          <ProtectedAdminRoute>
            <AdminMembershipsPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/membership-plans"
        element={
          <ProtectedAdminRoute>
            <AdminMembershipPlansPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/coupons"
        element={
          <ProtectedAdminRoute>
            <AdminCouponsPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/videos"
        element={
          <ProtectedAdminRoute>
            <AdminVideosPage />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
