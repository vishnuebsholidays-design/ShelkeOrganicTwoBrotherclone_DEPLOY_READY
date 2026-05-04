import './HomePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import API from '../api';

const WISHLIST_KEY = 'wishlistItems';

/**
 * Category shortcut data.
 *
 * Why used:
 * - Shows premium category cards on homepage.
 * - Used for quick customer navigation to category pages.
 */
const homeCategories = [
  { name: 'Ghee', icon: '🧈', link: '/shop?category=Ghee' },
  { name: 'Oil', icon: '🫒', link: '/shop?category=Oil' },
  { name: 'Atta', icon: '🌾', link: '/shop?category=Atta' },
  { name: 'Rice', icon: '🍚', link: '/shop?category=Rice' },
  { name: 'Spices', icon: '🌶️', link: '/shop?category=Spices' },
  { name: 'Snacks', icon: '🥨', link: '/shop?category=Snacks' },
  { name: 'Jaggery', icon: '🍯', link: '/shop?category=Jaggery' },
  { name: 'Gift Hampers', icon: '🎁', link: '/shop?category=Gift Hampers' },
];

/**
 * Premium animated offer slides.
 *
 * Why used:
 * - Creates video-like animated promotional banner without requiring MP4 files.
 * - Offers automatically change every few seconds.
 * - Later this same structure can be connected with admin banner API.
 */
const premiumOfferSlides = [
  {
    kicker: 'LIMITED PERIOD OFFER',
    title: 'Organic Essentials Sale',
    subtitle: 'Save more on daily farm-fresh groceries, ghee, atta, rice and oils.',
    badge: 'UP TO 25% OFF',
    icon: '🌾',
  },
  {
    kicker: 'MEMBERSHIP SPECIAL',
    title: 'Premium Member Benefits',
    subtitle: 'Early access, special pricing and exclusive savings on repeat orders.',
    badge: 'JOIN & SAVE MORE',
    icon: '🏆',
  },
  {
    kicker: 'FARM FRESH DEALS',
    title: 'Fresh From Trusted Farms',
    subtitle: 'Traditional quality products prepared with honest ingredients.',
    badge: 'PURE • NATURAL',
    icon: '🥬',
  },
];

/**
 * HomePage component.
 *
 * Functionality:
 * - Loads customer header and footer.
 * - Shows premium animated offer banner without any video file.
 * - Fetches featured products from admin product API.
 * - Shows featured products in grid on desktop and 2-card swipe on mobile.
 * - Opens product quick-view popup.
 * - Shows Watch & Shop video cards.
 */
function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [watchVideos, setWatchVideos] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalAdded, setModalAdded] = useState(false);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);

  useEffect(() => {
    fetchWatchVideos();
    fetchFeaturedProducts();
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
   * Auto-rotates premium offer animation slides.
   *
   * Why used:
   * - Makes the banner feel like an animated offer video.
   * - Keeps homepage fresh without manual customer action.
   */
  useEffect(() => {
    const offerTimer = setInterval(() => {
      setActiveOfferIndex((current) => (current + 1) % premiumOfferSlides.length);
    }, 4200);

    return () => clearInterval(offerTimer);
  }, []);

  /**
   * Locks page scroll when product popup is open.
   *
   * Why used:
   * - Keeps modal focused.
   * - Lets user close popup by pressing Escape.
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
   * Fetch Watch & Shop videos from backend.
   *
   * Why used:
   * - Videos can be managed later from admin/backend.
   * - If backend is empty, fallback demo videos keep UI clean.
   */
  const fetchWatchVideos = async () => {
    try {
      const response = await axios.get(`${API}/watch-videos`);
      setWatchVideos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Watch videos fetch error:', error);
      setWatchVideos([]);
    }
  };

  /**
   * Fetch featured products from admin product API.
   *
   * Why used:
   * - Home page products remain dynamic.
   * - Product image, price, stock, badge and variants come from admin panel.
   */
  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      const list = Array.isArray(response.data) ? response.data : [];

      setFeaturedProducts(
        list
          .filter((product) => Number(product.stock || 0) > 0)
          .slice(0, 4)
          .map((product) => ({
            id: product.id,
            name: product.name,
            tagline: product.short_tagline || product.category || 'Premium quality product',
            price: Number(product.price || 0),
            rating: product.rating || '4.9',
            reviews: product.review_count || product.reviews || 0,
            badge: product.badge || 'Featured',
            variant: product.variant_info || product.variant || 'Default',
            image: product.image || product.image_url || product.thumbnail_url || '',
            image_url: product.image || product.image_url || product.thumbnail_url || '',
            category: product.category || '',
            description: product.description || '',
            short_tagline: product.short_tagline || '',
            variant_info: product.variant_info || product.variant || 'Default',
            review_count: product.review_count || product.reviews || 0,
            stock: product.stock ?? 1,
          }))
      );
    } catch (error) {
      console.error('Featured products fetch error:', error);
      setFeaturedProducts([]);
    }
  };

  /**
   * Watch & Shop fallback videos.
   *
   * Why used:
   * - Keeps section visible even before admin videos are added.
   */
  const displayVideos = useMemo(() => {
    if (watchVideos.length > 0) return watchVideos;

    return [
      {
        id: 'demo-1',
        title: "There's a story behind every product",
        subtitle: 'Watch farm stories and shop directly.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail_url: '',
        product_name: 'Khapli Atta',
        product_price: 425,
        product_link: '/shop',
      },
      {
        id: 'demo-2',
        title: 'Traditional A2 Ghee Process',
        subtitle: 'Pure, slow-made and farm sourced.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail_url: '',
        product_name: 'A2 Gir Cow Ghee',
        product_price: 935,
        product_link: '/shop',
      },
      {
        id: 'demo-3',
        title: 'Why customers choose real food',
        subtitle: 'Better ingredients, better everyday meals.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail_url: '',
        product_name: 'Groundnut Oil',
        product_price: 425,
        product_link: '/shop',
      },
      {
        id: 'demo-4',
        title: 'Fresh seasonal wellness product',
        subtitle: 'Amlaprash and natural immunity support.',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail_url: '',
        product_name: 'Amlaprash',
        product_price: 675,
        product_link: '/shop',
      },
    ];
  }, [watchVideos]);

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
   * Loads wishlist ids for logged-in customers.
   */
  const loadWishlistIds = () => {
    if (!getLoggedInCustomer()) {
      setWishlistIds([]);
      return;
    }

    const wishlist = getWishlistItems();
    setWishlistIds(wishlist.map((item) => String(item.id)));
  };

  /**
   * Adds/removes product from wishlist only after customer login.
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

  /**
   * Adds product to cart.
   *
   * Why used:
   * - Product card and quick-view modal share same add-to-cart logic.
   */
  const handleAddFeaturedProduct = (product, quantity = 1) => {
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

  const mediaLogos = ['The Better India', 'Economic Times', 'Hindustan Times', 'YourStory', 'Forbes'];

  const collectionCards = [
    { title: 'Summer Essentials', text: 'Cooling pantry essentials for everyday healthy meals.', link: '/shop' },
    { title: 'Membership Deals', text: 'Special prices and rewards for regular customers.', link: '/membership' },
    { title: 'New Launches', text: 'Fresh arrivals with premium quality and authentic sourcing.', link: '/shop' },
  ];

  const categoryShowcase = [
    { title: 'Pure Ghee Collection', subtitle: 'Traditional bilona style richness for daily nutrition.' },
    { title: 'Cold Pressed Oils', subtitle: 'Naturally extracted oils with original aroma and taste.' },
    { title: 'Stone Ground Atta', subtitle: 'Wholesome flour for soft rotis and healthy meals.' },
  ];

  const activeOffer = premiumOfferSlides[activeOfferIndex];

  return (
    <div className="homepage">
      <Header />

      <section className="home-hero home-animate">
        <div className="home-container home-hero__inner">
          <div className="home-hero__right">
            <div className="home-hero__image-card">
              <div className="premium-offer-animation" aria-live="polite">
                <div className="premium-glow" />
                <div className="premium-ring premium-ring-1" />
                <div className="premium-ring premium-ring-2" />
                <div className="premium-video-lines" />
                <div className="floating-leaf leaf-1">🌿</div>
                <div className="floating-leaf leaf-2">🍃</div>
                <div className="floating-leaf leaf-3">🌾</div>

                <div key={activeOffer.title} className="premium-banner-content">
                  <div className="premium-offer-icon">{activeOffer.icon}</div>
                  <span>{activeOffer.kicker}</span>
                  <h2>{activeOffer.title}</h2>
                  <p>{activeOffer.subtitle}</p>
                  <strong className="premium-offer-badge">{activeOffer.badge}</strong>
                </div>

                <div className="premium-offer-dots" aria-label="Offer slider indicators">
                  {premiumOfferSlides.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      className={index === activeOfferIndex ? 'active' : ''}
                      onClick={() => setActiveOfferIndex(index)}
                      aria-label={`Show ${item.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="home-hero__left">
            <div className="home-hero__eyebrow">Pure • Organic • Farmer Sourced</div>

            <h1 className="home-hero__title">
              Healthy Food,
              <br />
              Straight From
              <br />
              The Farm
            </h1>

            <p className="home-hero__subtitle">
              Discover naturally grown essentials made with traditional methods,
              honest ingredients, and trusted sourcing.
            </p>

            <div className="home-hero__actions">
              <Link to="/shop" className="btn btn--primary">Shop Now</Link>
              <Link to="/membership" className="btn btn--outline">Join Membership</Link>
            </div>

            <div className="home-hero__stats">
              <HeroStat title="100%" value="Natural" />
              <HeroStat title="Lab" value="Tested" />
              <HeroStat title="Direct" value="Farmer" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section--tight">
        <div className="home-container">
          <div className="category-shortcuts">
            {homeCategories.map((category) => (
              <Link key={category.name} to={category.link} className="category-shortcut">
                <span className="category-shortcut__icon" aria-hidden="true">{category.icon}</span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/shop" className="btn btn--outline btn--small">View All</Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="shop-empty-box">No featured products found.</div>
          ) : (
            <div className="product-grid product-grid--swipe">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdded={addedId === product.id}
                  isWishlisted={wishlistIds.includes(String(product.id))}
                  onOpen={() => openProductModal(product)}
                  onAdd={() => handleAddFeaturedProduct(product, 1)}
                  onWishlist={() => handleToggleWishlist(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="watch-shop-section">
        <div className="home-container">
          <div className="watch-shop-heading">
            <div>
              <span className="watch-shop-kicker">Watch & Shop</span>
              <h2>It Takes A Village To Make Good Food</h2>
              <p>Explore product stories, farm demos and shop directly from videos.</p>
            </div>
            <Link to="/shop" className="btn btn--outline btn--small">Shop All</Link>
          </div>

          <div className="watch-shop-row">
            {displayVideos.map((video) => (
              <WatchShopCard key={video.id} video={video} onPlay={() => setActiveVideo(video)} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">Shop By Concern</h2>
          </div>

          <div className="concern-grid">
            <ConcernCard title="Diabetes Care" subtitle="Better everyday choices" />
            <ConcernCard title="Weight Loss" subtitle="Light and clean eating" />
            <ConcernCard title="Gut Health" subtitle="Balanced digestion support" />
            <ConcernCard title="Immunity Boost" subtitle="Strong natural nutrition" />
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="offer-grid">
            {collectionCards.map((item) => (
              <OfferCard key={item.title} title={item.title} text={item.text} link={item.link} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">Shop Popular Categories</h2>
          </div>

          <div className="showcase-grid">
            {categoryShowcase.map((item) => (
              <CategoryShowcaseCard key={item.title} title={item.title} subtitle={item.subtitle} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-story">
        <div className="home-container home-story__inner">
          <div className="home-story__left">
            <div className="home-story__eyebrow">Our Story</div>
            <h2 className="section-title section-title--left">From Farmers To Your Home</h2>
            <p className="home-story__text">
              We work directly with farmers to bring pure, chemical-free food.
              Every product is traceable, lab-tested, and prepared using methods
              that protect nutrition, flavour, and trust.
            </p>
          </div>

          <div className="home-story__right">
            <div className="story-grid">
              <StoryPoint text="100% Traceable Products" />
              <StoryPoint text="Lab Tested Quality" />
              <StoryPoint text="Direct Farmer Sourcing" />
              <StoryPoint text="No Chemicals" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">Featured In</h2>
          </div>
          <div className="media-logo-grid">
            {mediaLogos.map((item) => <div key={item} className="media-logo-card">{item}</div>)}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">What Customers Say</h2>
          </div>

          <div className="testimonial-grid">
            <TestimonialCard name="Rohit Sharma" text="Best organic products I’ve used. Quality is top class and delivery experience was smooth." />
            <TestimonialCard name="Priya Deshmukh" text="Feels like real village food. The taste and authenticity are clearly different." />
            <TestimonialCard name="Amit Patil" text="Packaging, service, and taste are all excellent. Will keep ordering regularly." />
          </div>
        </div>
      </section>

      {activeVideo ? <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} /> : null}

      {selectedProduct ? (
        <ProductQuickViewModal
          product={selectedProduct}
          quantity={modalQty}
          setQuantity={setModalQty}
          onClose={closeProductModal}
          onAdd={() => handleAddFeaturedProduct(selectedProduct, modalQty)}
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
 * Converts product image path into full image URL.
 *
 * Why used:
 * - Backend can return external URL, /uploads path, or uploads path.
 */
function getFullImageUrl(url) {
  if (!url) return '';

  const image = String(url).trim();

  if (!image) return '';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/uploads')) return `${API}${image}`;
  if (image.startsWith('uploads')) return `${API}/${image}`;

  return image;
}

/**
 * Converts YouTube normal/share URLs into embed URLs.
 *
 * Why used:
 * - Video modal iframe requires embed-ready URL.
 */
function getVideoEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;

  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  return url;
}

/**
 * ProductCard component.
 *
 * Functionality:
 * - Shows product image, badge, wishlist icon, rating, variant and add-to-cart.
 * - Opens quick-view when product image/body is clicked.
 */
function ProductCard({ product, onAdd, isAdded, isWishlisted, onOpen, onWishlist }) {
  const imageSrc = getFullImageUrl(product.image || product.image_url);
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
      <button type="button" className="product-card__image-wrap product-card__open" onClick={onOpen}>
        {imageSrc ? <img className="product-card__img" src={imageSrc} alt={product.name} /> : <div className="product-card__image" />}
        {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
        <button
          type="button"
          className={`product-card__wishlist ${isWishlisted ? 'active' : ''}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={stopAndWishlist}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
        {outOfStock ? <span className="stock-overlay">Out of Stock</span> : null}
      </button>

      <button type="button" className="product-card__body product-card__body-btn" onClick={onOpen}>
        <div className="product-card__name-price">
          <h3 className="product-card__name">{product.name}</h3>
          <strong className="product-card__price-new">₹{Number(product.price || 0)}</strong>
        </div>

        <p className="product-card__tagline">{product.tagline || product.short_tagline || product.category || 'Premium quality product'}</p>

        <div className="product-card__rating">
          <span>★★★★★</span>
          <b>{product.rating || '4.9'}</b>
          <small>| {product.reviews || product.review_count || 0} Reviews</small>
        </div>

        <select
          className="product-card__variant"
          value={product.variant || product.variant_info || 'Default'}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => event.stopPropagation()}
        >
          <option>{product.variant || product.variant_info || 'Default'}</option>
        </select>
      </button>

      <button
        type="button"
        onClick={stopAndAdd}
        disabled={outOfStock}
        className={`product-card__button ${isAdded ? 'is-added' : ''} ${outOfStock ? 'disabled' : ''}`}
      >
        {outOfStock ? 'OUT OF STOCK' : isAdded ? 'ADDED ✓' : 'ADD TO CART'}
      </button>
    </div>
  );
}

/**
 * WatchShopCard component.
 *
 * Functionality:
 * - Shows video story card.
 * - Opens video modal on click.
 * - Links attached product below video.
 */
function WatchShopCard({ video, onPlay }) {
  const productLink = video.product_link || (video.product_id ? `/product/${video.product_id}` : '/shop');

  return (
    <div className="watch-card">
      <button type="button" className="watch-card__media" onClick={onPlay}>
        {video.thumbnail_url ? <img src={getFullImageUrl(video.thumbnail_url)} alt={video.title} /> : <div className="watch-card__placeholder">{video.title}</div>}
        <span className="watch-card__play">▶</span>
      </button>

      <Link to={productLink} className="watch-card__product">
        <span className="watch-card__product-img">
          {video.product_image ? <img src={getFullImageUrl(video.product_image)} alt={video.product_name} /> : null}
        </span>
        <span>
          <strong>{video.product_name || 'Shop Product'}</strong>
          {video.product_price ? <small>₹{video.product_price}</small> : <small>View details</small>}
        </span>
      </Link>
    </div>
  );
}

/**
 * Video modal component.
 */
function VideoModal({ video, onClose }) {
  const embedUrl = getVideoEmbedUrl(video.video_url);
  const isMp4 = embedUrl.toLowerCase().includes('.mp4');

  return (
    <div className="video-modal">
      <div className="video-modal__box">
        <button className="video-modal__close" type="button" onClick={onClose}>×</button>
        {isMp4 ? (
          <video controls autoPlay src={embedUrl} />
        ) : (
          <iframe src={embedUrl} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        )}
        <div className="video-modal__content">
          <h3>{video.title}</h3>
          <p>{video.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductQuickViewModal component.
 *
 * Functionality:
 * - Shows product details without changing page.
 * - Allows quantity selection and add-to-cart.
 */
function ProductQuickViewModal({ product, quantity, setQuantity, onClose, onAdd, added, isWishlisted, onWishlist }) {
  const imageSrc = getFullImageUrl(product.image || product.image_url);
  const outOfStock = Number(product.stock || 0) <= 0;

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onWishlist();
  };

  return (
    <div className="quick-view-overlay" onMouseDown={onClose}>
      <div className="quick-view-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="quick-view-close" onClick={onClose}>×</button>

        <div className="quick-view-image-box">
          {imageSrc ? <img src={imageSrc} alt={product.name} /> : <div className="quick-view-placeholder">Product Image</div>}
          {outOfStock ? <span className="quick-stock-overlay">Out of Stock</span> : null}
        </div>

        <div className="quick-view-content">
          <div className="quick-top-row">
            <span className={`quick-badge ${outOfStock ? 'danger' : ''}`}>{outOfStock ? 'Out of Stock' : product.badge || 'Featured'}</span>
            <button
              type="button"
              className={`quick-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlist}
            >
              {isWishlisted ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>
          <h2>{product.name}</h2>
          <p className="quick-tagline">{product.short_tagline || product.tagline || 'Pure organic product from trusted sourcing.'}</p>
          <div className="quick-price">₹{Number(product.price || 0)}</div>

          <div className="quick-meta">
            <p><strong>Category:</strong> {product.category || '-'}</p>
            <p><strong>Variant:</strong> {product.variant_info || product.variant || '-'}</p>
            <p><strong>Rating:</strong> {product.rating || '4.9'} / 5</p>
            <p><strong>Reviews:</strong> {product.review_count || product.reviews || 0}</p>
            <p><strong>Availability:</strong> <span className={outOfStock ? 'danger-text' : 'success-text'}>{outOfStock ? 'Out of Stock' : 'In Stock'}</span></p>
          </div>

          <div className="quick-description">
            <h3>Description</h3>
            <p>{product.description || 'Premium product from your organic store catalog. Product description can be updated from admin panel.'}</p>
          </div>

          <div className="quick-actions">
            <div className="qty-box">
              <button type="button" disabled={outOfStock} onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>−</button>
              <span>{quantity}</span>
              <button type="button" disabled={outOfStock} onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            </div>

            <button type="button" className={`quick-add-btn ${added ? 'added' : ''}`} onClick={onAdd} disabled={outOfStock}>
              {outOfStock ? 'Out of Stock' : added ? 'Added ✓' : 'Add To Cart'}
            </button>

            <Link to="/cart" className="quick-cart-link">Go To Cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ title, value }) {
  return (
    <div className="hero-stat">
      <div className="hero-stat__value">{value}</div>
      <div className="hero-stat__title">{title}</div>
    </div>
  );
}

function ConcernCard({ title, subtitle }) {
  return (
    <div className="concern-card">
      <div className="concern-card__image" />
      <h4 className="concern-card__title">{title}</h4>
      <p className="concern-card__subtitle">{subtitle}</p>
    </div>
  );
}

function OfferCard({ title, text, link }) {
  return (
    <div className="offer-card">
      <div className="offer-card__eyebrow">Special Collection</div>
      <h3 className="offer-card__title">{title}</h3>
      <p className="offer-card__text">{text}</p>
      <Link to={link} className="offer-card__link">Explore Now →</Link>
    </div>
  );
}

function CategoryShowcaseCard({ title, subtitle }) {
  return (
    <div className="showcase-card">
      <div className="showcase-card__image">Organic</div>
      <div className="showcase-card__body">
        <h3 className="showcase-card__title">{title}</h3>
        <p className="showcase-card__subtitle">{subtitle}</p>
        <Link to="/shop" className="showcase-card__link">Shop Now →</Link>
      </div>
    </div>
  );
}

function StoryPoint({ text }) {
  return <div className="story-point">{text}</div>;
}

function TestimonialCard({ name, text }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-card__quote">“</div>
      <p className="testimonial-card__text">{text}</p>
      <h4 className="testimonial-card__name">{name}</h4>
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
    short_tagline: product.short_tagline || product.tagline || '',
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

export default HomePage;
