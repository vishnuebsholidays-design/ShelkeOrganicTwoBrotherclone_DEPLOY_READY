import './WishlistPage.css';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import API from '../api';

const WISHLIST_KEY = 'wishlistItems';

/**
 * WishlistPage
 *
 * Functionality:
 * - Shows all products added by wishlist heart button.
 * - Customer can remove items from wishlist.
 * - Customer can add wishlist item to cart.
 * - Header wishlist count updates automatically.
 */
function WishlistPage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const user = getLoggedInCustomer();

    if (!user) {
      setItems([]);
      navigate('/login');
      return;
    }

    loadWishlist();
  }, [navigate]);

  const loadWishlist = () => {
    if (!getLoggedInCustomer()) {
      setItems([]);
      return;
    }

    setItems(getWishlistItems());
  };

  const removeItem = (productId) => {
    const next = items.filter((item) => String(item.id) !== String(productId));
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleAddToCart = (product) => {
    if (Number(product.stock || 0) <= 0) {
      alert('This product is currently out of stock.');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      image: product.image || product.image_url || '',
      category: product.category || '',
      quantity: 1,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="wishlist-page">
      <Header />

      <main className="wishlist-container">
        <div className="wishlist-head">
          <div>
            <p>Saved Products</p>
            <h1>My Wishlist</h1>
            <span>{items.length} product(s) saved</span>
          </div>

          <Link to="/shop" className="wishlist-shop-btn">
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="wishlist-empty">
            <h2>Your wishlist is empty</h2>
            <p>Click the heart icon on products to save them here.</p>
            <Link to="/shop">Shop Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((product) => {
              const imageSrc = getImageSrc(product.image || product.image_url);
              const outOfStock = Number(product.stock || 0) <= 0;

              return (
                <div className="wishlist-card" key={product.id}>
                  <Link to={`/product/${product.id}`} className="wishlist-image">
                    {imageSrc ? (
                      <img src={imageSrc} alt={product.name} />
                    ) : (
                      <span>Product Image</span>
                    )}
                  </Link>

                  <div className="wishlist-body">
                    <h3>{product.name}</h3>
                    <p>{product.short_tagline || product.category || 'Premium quality product'}</p>
                    <strong>₹{Number(product.price || 0)}</strong>

                    <div className="wishlist-actions">
                      <button
                        type="button"
                        className={`wishlist-cart-btn ${addedId === product.id ? 'added' : ''}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={outOfStock}
                      >
                        {outOfStock ? 'Out of Stock' : addedId === product.id ? 'Added ✓' : 'Add To Cart'}
                      </button>

                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={() => removeItem(product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function getLoggedInCustomer() {
  try {
    const user = JSON.parse(localStorage.getItem('customerUser') || 'null');
    return user?.email || user?.phone || user?.id ? user : null;
  } catch {
    return null;
  }
}

function getWishlistItems() {
  try {
    const list = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function getImageSrc(image) {
  if (!image) return '';

  const src = String(image).trim();

  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/uploads')) return `${API}${src}`;
  if (src.startsWith('uploads')) return `${API}/${src}`;

  return src;
}

export default WishlistPage;
