import './ShopPage.css';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import API from '../api';

const WISHLIST_KEY = 'wishlistItems';

/**
 * ShopPage
 *
 * Functionality:
 * - Loads products from admin/backend API.
 * - Search and category filter are preserved.
 * - Product image click opens quick-view only. It does not add product to cart.
 * - Cart count increases only when Add To Cart button is clicked.
 * - Wishlist button saves product in localStorage and updates Header wishlist count.
 * - Quick-view popup is made smaller and professional.
 */
function ShopPage() {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [addedId, setAddedId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalAdded, setModalAdded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search') || '';
    const categoryQuery = params.get('category') || 'All';

    setSearch(searchQuery);
    setCategory(categoryQuery || 'All');
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    loadWishlistIds();

    const refreshWishlist = () => loadWishlistIds();
    window.addEventListener('wishlist-updated', refreshWishlist);
    window.addEventListener('storage', refreshWishlist);

    return () => {
      window.removeEventListener('wishlist-updated', refreshWishlist);
      window.removeEventListener('storage', refreshWishlist);
    };
  }, []);

  /**
   * Locks background scroll while quick-view popup is open.
   */
  useEffect(() => {
    if (!selectedProduct) return;

    const handleEsc = (event) => {
      if (event.key === 'Escape') closeProductModal();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [selectedProduct]);

  /**
   * Fetch products from backend.
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API}/products`);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Product fetch error:', err);
      setProducts([]);
      setError('Unable to load products. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads wishlist product ids from localStorage.
   */
  const loadWishlistIds = () => {
    const wishlist = getWishlistItems();
    setWishlistIds(wishlist.map((item) => String(item.id)));
  };

  const categories = useMemo(() => {
    const unique = products
      .map((item) => item.category)
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean);

    return ['All', ...Array.from(new Set(unique))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = String(product.name || '').toLowerCase();
      const productCategory = String(product.category || '').toLowerCase();
      const productTagline = String(product.short_tagline || '').toLowerCase();
      const searchText = search.trim().toLowerCase();
      const selectedCategory = String(category || 'All').toLowerCase();

      const matchesSearch =
        !searchText ||
        productName.includes(searchText) ||
        productCategory.includes(searchText) ||
        productTagline.includes(searchText);

      const matchesCategory =
        selectedCategory === 'all' || productCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  /**
   * Opens product quick-view popup.
   */
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalQty(1);
    setModalAdded(false);
  };

  /**
   * Closes product quick-view popup.
   */
  const closeProductModal = () => {
    setSelectedProduct(null);
    setModalQty(1);
    setModalAdded(false);
  };

  /**
   * Adds product to cart only when Add To Cart button is clicked.
   */
  const handleAddToCart = (product, quantity = 1) => {
    if (!product) return;

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
      quantity,
    });

    setAddedId(product.id);
    setModalAdded(true);

    setTimeout(() => {
      setAddedId(null);
      setModalAdded(false);
    }, 1300);
  };

  /**
   * Adds/removes product from wishlist.
   */
  const handleToggleWishlist = (product) => {
    if (!getLoggedInCustomer()) {
      alert('Please login to save products in your wishlist.');
      navigate('/login');
      return;
    }

    const nextWishlist = toggleWishlistProduct(product);
    setWishlistIds(nextWishlist.map((item) => String(item.id)));
  };

  return (
    <div className="shop-page">
      <Header />

      <section className="shop-toolbar">
        <div className="shop-container">
          <div className="shop-toolbar-row">
            <input
              className="shop-input"
              type="text"
              placeholder="Search product"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="shop-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All Categories' : item}
                </option>
              ))}
            </select>
          </div>

          <div className="shop-title-row">
            <div>
              <h1>Shop All Products</h1>
              <p>{filteredProducts.length} products available</p>
            </div>

            <Link to="/" className="shop-back-btn">
              Back Home
            </Link>
          </div>
        </div>
      </section>

      <section className="shop-products-section">
        <div className="shop-container">
          {loading && <div className="shop-status-box">Loading products...</div>}
          {!loading && error && <div className="shop-status-box error">{error}</div>}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="shop-status-box">No products found.</div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdded={addedId === product.id}
                  isWishlisted={wishlistIds.includes(String(product.id))}
                  onOpen={() => openProductModal(product)}
                  onAdd={() => handleAddToCart(product, 1)}
                  onWishlist={() => handleToggleWishlist(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct ? (
        <ProductQuickViewModal
          product={selectedProduct}
          quantity={modalQty}
          setQuantity={setModalQty}
          onClose={closeProductModal}
          onAdd={() => handleAddToCart(selectedProduct, modalQty)}
          added={modalAdded}
          isWishlisted={wishlistIds.includes(String(selectedProduct.id))}
          onWishlist={() => handleToggleWishlist(selectedProduct)}
        />
      ) : null}

      <Footer />
    </div>
  );
}

/**
 * Product card used in shop page.
 *
 * Important:
 * - Image/body click opens product popup only.
 * - Wishlist button has stopPropagation so popup/cart will not trigger.
 * - Add button is the only action that adds item into cart.
 */
function ProductCard({ product, isAdded, isWishlisted, onOpen, onAdd, onWishlist }) {
  const imageSrc = getImageSrc(product.image || product.image_url);
  const outOfStock = Number(product.stock || 0) <= 0;

  const stopAndAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAdd();
  };

  const stopAndWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onWishlist();
  };

  return (
    <div className="product-card">
      <button type="button" className="product-image-wrap" onClick={onOpen}>
        {imageSrc ? (
          <img src={imageSrc} alt={product.name} />
        ) : (
          <div className="product-image-placeholder">Product Image</div>
        )}

        {product.badge ? <span className="product-badge">{product.badge}</span> : null}

        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={stopAndWishlist}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>

        {outOfStock ? <span className="stock-overlay">Out of Stock</span> : null}
      </button>

      <button type="button" className="product-card-body product-card-open" onClick={onOpen}>
        <div className="product-name-price">
          <h3>{product.name}</h3>
          <strong>₹{Number(product.price || 0)}</strong>
        </div>

        <p className="product-subtitle">
          {product.short_tagline || product.category || 'Premium quality product'}
        </p>

        <div className="rating-row">
          <span>★★★★★</span>
          <b>{product.rating || '4.9'}</b>
          <small>| {product.review_count || product.reviews || 0} Reviews</small>
        </div>

        <select
          className="variant-select"
          value={product.variant_info || product.variant || 'Default'}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => event.stopPropagation()}
        >
          <option>{product.variant_info || product.variant || 'Default'}</option>
        </select>
      </button>

      <button
        type="button"
        className={`tb-add-btn ${isAdded ? 'added' : ''} ${outOfStock ? 'disabled' : ''}`}
        onClick={stopAndAdd}
        disabled={outOfStock}
      >
        {outOfStock ? 'OUT OF STOCK' : isAdded ? 'ADDED ✓' : 'ADD TO CART'}
      </button>
    </div>
  );
}

/**
 * Smaller professional quick-view modal.
 */
function ProductQuickViewModal({
  product,
  quantity,
  setQuantity,
  onClose,
  onAdd,
  added,
  isWishlisted,
  onWishlist,
}) {
  const imageSrc = getImageSrc(product.image || product.image_url);
  const outOfStock = Number(product.stock || 0) <= 0;

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onWishlist();
  };

  return (
    <div className="quick-view-overlay" onMouseDown={onClose}>
      <div className="quick-view-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="quick-view-close" onClick={onClose}>
          ×
        </button>

        <div className="quick-view-image-box">
          {imageSrc ? (
            <img src={imageSrc} alt={product.name} />
          ) : (
            <div className="quick-view-placeholder">Product Image</div>
          )}

          {outOfStock ? <span className="quick-stock-overlay">Out of Stock</span> : null}
        </div>

        <div className="quick-view-content">
          <div className="quick-top-row">
            <span className={`quick-badge ${outOfStock ? 'danger' : ''}`}>
              {outOfStock ? 'Out of Stock' : product.badge || 'Featured'}
            </span>

            <button
              type="button"
              className={`quick-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlist}
            >
              {isWishlisted ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>

          <h2>{product.name}</h2>
          <p className="quick-tagline">
            {product.short_tagline || 'Pure organic product from trusted sourcing.'}
          </p>

          <div className="quick-price">₹{Number(product.price || 0)}</div>

          <div className="quick-meta">
            <p><strong>Category:</strong> {product.category || '-'}</p>
            <p><strong>Variant:</strong> {product.variant_info || product.variant || '-'}</p>
            <p><strong>Rating:</strong> {product.rating || '4.9'} / 5</p>
            <p><strong>Reviews:</strong> {product.review_count || product.reviews || 0}</p>
            <p>
              <strong>Availability:</strong>{' '}
              <span className={outOfStock ? 'danger-text' : 'success-text'}>
                {outOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </p>
          </div>

          <div className="quick-description">
            <h3>Description</h3>
            <p>
              {product.description ||
                'Premium product from your organic store catalog. Product description can be updated from admin panel.'}
            </p>
          </div>

          <div className="quick-actions">
            <div className="qty-box">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className={`quick-add-btn ${added ? 'added' : ''}`}
              onClick={onAdd}
              disabled={outOfStock}
            >
              {outOfStock ? 'Out of Stock' : added ? 'Added ✓' : 'Add To Cart'}
            </button>

            <Link to="/cart" className="quick-cart-link">
              Go To Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Converts image path into browser-ready image URL.
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
 * Reads wishlist list from localStorage.
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
 * Saves/removes product in wishlist and notifies Header.
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

export default ShopPage;
