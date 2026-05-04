import './CartPage.css';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { calculateDiscount, getActiveMembership } from '../utils/membershipUtils';
import API from '../api';


function CartPage() {
  const cart = useCart();

  const cartItems = cart.cartItems || cart.items || [];
  const updateQuantity = cart.updateQuantity || cart.updateCartQuantity;
  const removeFromCart = cart.removeFromCart || cart.removeItem;
  const clearCart = cart.clearCart;
  const decreaseQuantity = cart.decreaseQuantity;
  const increaseQuantity = cart.increaseQuantity;

  const [membership, setMembership] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const customerUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('customerUser') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      if (!customerUser?.email) {
        setMembership(null);
        setDiscountPercent(0);
        return;
      }

      const data = await getActiveMembership(customerUser.email);

      if (data.hasMembership) {
        setMembership(data.membership);
        setDiscountPercent(data.discountPercent);
      } else {
        setMembership(null);
        setDiscountPercent(0);
      }
    } catch (error) {
      console.error('Cart membership error:', error);
      setMembership(null);
      setDiscountPercent(0);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const membershipDiscount = calculateDiscount(subtotal, discountPercent);
  const discountedSubtotal = subtotal - membershipDiscount;
  const shipping = discountedSubtotal >= 1499 || discountedSubtotal === 0 ? 0 : 99;
  const grandTotal = discountedSubtotal + shipping;

  useEffect(() => {
    localStorage.setItem(
      'cartPricing',
      JSON.stringify({
        subtotal,
        membershipDiscount,
        discountPercent,
        shipping,
        grandTotal,
        membership,
      })
    );
  }, [subtotal, membershipDiscount, discountPercent, shipping, grandTotal, membership]);

  const handleQtyChange = (id, qty) => {
    const finalQty = Math.max(1, qty);

    if (updateQuantity) {
      updateQuantity(id, finalQty);
    }
  };

  return (
    <div className="cart-page">
      <Header />

      <main className="cart-main">
        <div className="cart-container">
          <div className="cart-heading-row">
            <div>
              <p className="cart-eyebrow">Shopping Cart</p>
              <h1>Your Cart</h1>
              <p className="cart-subtitle">
                Review your selected products before checkout.
              </p>
            </div>

            <Link to="/shop" className="cart-shop-btn">
              Continue Shopping
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <h2>Your cart is empty</h2>
              <p>Add fresh organic products to continue.</p>
              <Link to="/shop">Start Shopping</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <section className="cart-items-card">
                <div className="cart-items-head">
                  <h2>Cart Items</h2>
                  {clearCart && (
                    <button onClick={clearCart} className="cart-clear-btn">
                      Clear Cart
                    </button>
                  )}
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const itemQty = Number(item.quantity || 1);
                    const itemTotal = Number(item.price || 0) * itemQty;
                    const itemDiscount = calculateDiscount(itemTotal, discountPercent);
                    const finalItemTotal = itemTotal - itemDiscount;

                    const imageSrc =
                      item.image || item.image_url
                        ? String(item.image || item.image_url).startsWith('http')
                          ? item.image || item.image_url
                          : `${API}${item.image || item.image_url}`
                        : '';

                    return (
                      <div className="cart-item" key={item.id}>
                        <div className="cart-item-img">
                          {imageSrc ? (
                            <img src={imageSrc} alt={item.name} />
                          ) : (
                            <span>Product</span>
                          )}
                        </div>

                        <div className="cart-item-info">
                          <h3>{item.name}</h3>
                          <p>₹{Number(item.price || 0).toFixed(2)} each</p>

                          {membership && (
                            <span className="member-line">
                              {membership.plan_name} member price applied
                            </span>
                          )}
                        </div>

                       <div className="cart-qty">
                         <button onClick={() => decreaseQuantity(item.id)}>
                           -
                         </button>

                         <span>{itemQty}</span>

                         <button onClick={() => increaseQuantity(item.id)}>
                           +
                         </button>
                       </div>

                        <div className="cart-item-price">
                          {membershipDiscount > 0 && (
                            <small>₹{itemTotal.toFixed(2)}</small>
                          )}
                          <strong>₹{finalItemTotal.toFixed(2)}</strong>
                        </div>

                        {removeFromCart && (
                          <button
                            className="cart-remove"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <aside className="cart-summary-card">
                <h2>Order Summary</h2>

                {membership ? (
                  <div className="membership-active-box">
                    <strong>👑 {membership.plan_name} Active</strong>
                    <span>{discountPercent}% discount applied automatically</span>
                  </div>
                ) : (
                  <div className="membership-upgrade-box">
                    <strong>Become a member</strong>
                    <span>Get automatic discounts on every order.</span>
                    <Link to="/membership">View Plans</Link>
                  </div>
                )}

                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>

                <div className="summary-row discount">
                  <span>Membership Discount</span>
                  <strong>- ₹{membershipDiscount.toFixed(2)}</strong>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <strong>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</strong>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total">
                  <span>Total</span>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>

                <Link to="/checkout" className="checkout-btn">
                  Proceed To Checkout
                </Link>

                <p className="summary-note">
                  Discount will be carried automatically to checkout.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CartPage;