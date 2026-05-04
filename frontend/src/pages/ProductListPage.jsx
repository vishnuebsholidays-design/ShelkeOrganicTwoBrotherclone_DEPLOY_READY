import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import API from '../api';


/**
 * ProductListPage
 *
 * Admin Product Management मधून add/update/delete केलेले products
 * या page वर automatically show होतात.
 */
function ProductListPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Backend मधून products fetch करतो.
   */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Products fetch failed:', err);
      setProducts([]);
    }
  };

  /**
   * Image path ला proper URL मध्ये convert करतो.
   */
  const getImageSrc = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${API}${image}`;
    return `${API}/${image}`;
  };

  /**
   * Product add to cart करतो आणि button feedback दाखवतो.
   */
  const handleAddToCart = (product) => {
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
      quantity: 1,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.short_tagline || '').toLowerCase().includes(q) ||
          (p.badge || '').toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    return list;
  }, [products, searchText, categoryFilter]);

  return (
    <div className="shop-page">
      <Header />

      <main className="shop-container" style={{ paddingTop: '24px' }}>
        <div className="shop-toolbar-row">
          <input
            className="shop-input"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select
            className="shop-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
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

        <section className="shop-products-section">
          {filteredProducts.length === 0 ? (
            <div className="shop-empty-box">No products found.</div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const imageSrc = getImageSrc(product.image || product.image_url);
                const isOutOfStock = Number(product.stock || 0) <= 0;

                return (
                  <div
                    key={product.id}
                    className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                  >
                    <Link to={`/product/${product.id}`} className="product-image-wrap">
                      {imageSrc ? (
                        <img src={imageSrc} alt={product.name} />
                      ) : (
                        <div className="product-image-placeholder">Product Image</div>
                      )}

                      {product.badge && (
                        <span className="product-badge">{product.badge}</span>
                      )}

                      <span className="wishlist-btn">♡</span>

                      {isOutOfStock && (
                        <div className="stock-overlay">Out of Stock</div>
                      )}
                    </Link>

                    <div className="product-card-body">
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
                        <small>| {product.review_count || 0} Reviews</small>
                      </div>

                      <select className="variant-select" defaultValue={product.variant_info || 'Default'}>
                        <option>{product.variant_info || 'Default'}</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className={`tb-add-btn ${addedId === product.id ? 'added' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                      disabled={isOutOfStock}
                      onClick={() => handleAddToCart(product)}
                    >
                      {isOutOfStock
                        ? 'OUT OF STOCK'
                        : addedId === product.id
                          ? 'ADDED ✓'
                          : 'ADD TO CART'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProductListPage;