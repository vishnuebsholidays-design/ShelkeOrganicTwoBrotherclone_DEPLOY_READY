import './ProductDetailsPage.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import API from '../api';

const WISHLIST_KEY = 'wishlistItems';

/**
 * ProductDetailsPage
 *
 * Functionality:
 * - Loads selected product from backend.
 * - Product details page does not add item to cart automatically.
 * - Cart count changes only after Add To Cart button click.
 * - Wishlist button saves item in localStorage and updates Header wishlist count.
 * - Keeps responsive professional layout.
 */
function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    fetchProduct();
    loadWishlistIds();

    const refreshWishlist = () => loadWishlistIds();
    window.addEventListener('wishlist-updated', refreshWishlist);
    window.addEventListener('storage', refreshWishlist);

    return () => {
      window.removeEventListener('wishlist-updated', refreshWishlist);
      window.removeEventListener('storage', refreshWishlist);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Fetches all products and finds current product by id.
   */
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API}/products`);
      const items = Array.isArray(response.data) ? response.data : [];
      const foundProduct = items.find((item) => String(item.id) === String(id));

      if (!foundProduct) {
        setError('Product not found.');
        setProduct(null);
      } else {
        setProduct(foundProduct);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Unable to load product details.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads wishlist ids from localStorage.
   */
  const loadWishlistIds = () => {
    const wishlist = getWishlistItems();
    setWishlistIds(wishlist.map((item) => String(item.id)));
  };

  /**
   * Adds current product into cart only after button click.
   */
  const handleAddToCart = () => {
    if (!product) return;

    const isOutOfStock = Number(product.stock || 0) <= 0;

    if (isOutOfStock) {
      alert('This product is currently out of stock.');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      image: product.image || product.image_url || '',
      category: product.category || '',
      quantity,
    });

    setAddedMessage(`${quantity} item(s) added to cart`);

    setTimeout(() => {
      setAddedMessage('');
    }, 1800);
  };

  /**
   * Toggles current product in wishlist.
   */
  const handleToggleWishlist = () => {
    if (!product) return;

    if (!getLoggedInCustomer()) {
      alert('Please login to save products in your wishlist.');
      navigate('/login');
      return;
    }

    const nextWishlist = toggleWishlistProduct(product);
    setWishlistIds(nextWishlist.map((item) => String(item.id)));
  };

  const isOutOfStock = product ? Number(product.stock || 0) <= 0 : false;
  const imageSrc = product ? getImageSrc(product.image || product.image_url) : '';
  const isWishlisted = product ? wishlistIds.includes(String(product.id)) : false;

  return (
    <div className="product-page">
      <Header />

      <main className="product-container">
        <Link to="/shop" className="back-btn">
          ← Back to Shop
        </Link>

        {loading && <div className="product-status">Loading product details...</div>}
        {!loading && error && <div className="product-status error">{error}</div>}

        {!loading && !error && product && (
          <section className="product-layout">
            <div className="product-image-box">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="image-placeholder">Product Image</div>
              )}

              {isOutOfStock && <div className="product-stock-overlay">Out of Stock</div>}
            </div>

            <div className="product-details">
              <div className="product-top-row">
                <span className={`badge ${isOutOfStock ? 'danger' : ''}`}>
                  {isOutOfStock ? 'Out of Stock' : product.badge || 'Featured'}
                </span>

                <button
                  type="button"
                  className={`detail-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={handleToggleWishlist}
                >
                  {isWishlisted ? '♥ Wishlisted' : '♡ Add Wishlist'}
                </button>
              </div>

              <h1>{product.name}</h1>

              <p className="tagline">
                {product.short_tagline || 'Pure organic product'}
              </p>

              <div className="price">₹{Number(product.price || 0)}</div>

              <div className="product-meta">
                <p><strong>Category:</strong> {product.category || '-'}</p>
                <p><strong>Variant:</strong> {product.variant_info || product.variant || '-'}</p>
                <p><strong>Reviews:</strong> {product.review_count || product.reviews || 0}</p>
                <p><strong>Rating:</strong> {product.rating || '4.9'} / 5</p>
                <p>
                  <strong>Availability:</strong>{' '}
                  <span className={isOutOfStock ? 'danger-text' : 'success-text'}>
                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </span>
                </p>
              </div>

              <div className="description">
                <h3>Description</h3>
                <p>
                  {product.description ||
                    'This product is part of your connected organic store catalog. You can update the description later from your database or admin panel.'}
                </p>
              </div>

              <div className="detail-actions">
                <div className="qty-box">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="add-btn"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
                </button>

                <Link to="/cart" className="go-cart-btn">
                  Go To Cart
                </Link>
              </div>

              {addedMessage && <div className="added-message">{addedMessage}</div>}

              <div className="benefits">
                <p>✓ Secure checkout</p>
                <p>✓ Fresh organic products</p>
                <p>✓ Membership discount applies at checkout</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

/**
 * Converts backend image path to full image URL.
 */
function getImageSrc(image) {
  if (!image) return '';

  const src = String(image).trim();

  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/uploads')) return `${API}${src}`;
  if (src.startsWith('uploads')) return `${API}/${src}`;

  return src;
}

/**
 * Reads wishlist from localStorage.
 */
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

/**
 * Adds/removes product from wishlist and notifies Header.
 */
function toggleWishlistProduct(product) {
  if (!getLoggedInCustomer()) return getWishlistItems();

  const current = getWishlistItems();
  const exists = current.some((item) => String(item.id) === String(product.id));

  const productData = {
    id: product.id,
    name: product.name,
    price: Number(product.price || 0),
    image: product.image || product.image_url || '',
    image_url: product.image || product.image_url || '',
    category: product.category || '',
    short_tagline: product.short_tagline || '',
    badge: product.badge || '',
    rating: product.rating || '4.9',
    review_count: product.review_count || product.reviews || 0,
    variant_info: product.variant_info || product.variant || '',
    stock: product.stock ?? 1,
  };

  const next = exists
    ? current.filter((item) => String(item.id) !== String(product.id))
    : [productData, ...current];

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('wishlist-updated'));

  return next;
}

export default ProductDetailsPage;
