import './BlogsPage.css';
import { useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    tag: 'Healthy Oils',
    title: 'Kachi Ghani vs Expeller Pressed vs Cold Pressed: The Oil Guide You Need',
    excerpt:
      'Understand the difference between traditional extraction methods and how to choose better cooking oils for Indian homes.',
    category: 'Oil',
    readTime: '6 min read',
    date: 'May 2026',
    imageText: 'Oil Guide',
  },
  {
    id: 2,
    tag: 'Ghee & Wellness',
    title: 'Ghee for Pregnancy and Postpartum: Ayurvedic Wisdom Meets Modern Nutrition',
    excerpt:
      'A practical guide to using pure ghee during pregnancy and postpartum with balanced, mindful nutrition habits.',
    category: 'Ghee',
    readTime: '7 min read',
    date: 'May 2026',
    imageText: 'A2 Ghee',
  },
  {
    id: 3,
    tag: 'Superfoods',
    title: 'Moringa Powder for Skin and Hair: What the Science Actually Shows',
    excerpt:
      'From antioxidants to everyday use, learn how moringa fits into a simple wellness routine for skin and hair.',
    category: 'Immunity',
    readTime: '5 min read',
    date: 'Apr 2026',
    imageText: 'Moringa',
  },
  {
    id: 4,
    tag: 'Kids Nutrition',
    title: 'Ghee for Kids India: Age-Wise Guide for Healthy Fats and Brain Development',
    excerpt:
      'A parent-friendly guide to introducing ghee in children’s meals with simple Indian food examples.',
    category: 'Ghee',
    readTime: '8 min read',
    date: 'Apr 2026',
    imageText: 'Kids Ghee',
  },
  {
    id: 5,
    tag: 'Smart Eating',
    title: 'Khapli Atta for Weight Management: High Fiber Atta and Smart Swaps',
    excerpt:
      'Explore how ancient grains and high-fiber atta can support better food choices for daily meals.',
    category: 'Atta',
    readTime: '6 min read',
    date: 'Mar 2026',
    imageText: 'Khapli Atta',
  },
  {
    id: 6,
    tag: 'Honey Truth',
    title: 'Is Store-Bought Honey Fake? What You Should Check Before Buying',
    excerpt:
      'Simple signs, label checks, and practical tips to choose honey with confidence for your family.',
    category: 'Honey',
    readTime: '5 min read',
    date: 'Mar 2026',
    imageText: 'Pure Honey',
  },
  {
    id: 7,
    tag: 'Baby Food',
    title: 'Ragi for Babies: When to Introduce and How to Prepare It Safely',
    excerpt:
      'A gentle guide to including ragi in baby meals with preparation tips and traditional food wisdom.',
    category: 'Breakfast',
    readTime: '7 min read',
    date: 'Feb 2026',
    imageText: 'Ragi',
  },
  {
    id: 8,
    tag: 'Festive Food',
    title: 'Healthy Festive Sweets Made with Honey for a Guilt-Free Celebration',
    excerpt:
      'Celebrate festivals with thoughtful ingredient swaps, natural sweetness, and homemade goodness.',
    category: 'Honey',
    readTime: '4 min read',
    date: 'Feb 2026',
    imageText: 'Festive',
  },
];

const categories = ['All', 'Ghee', 'Oil', 'Atta', 'Honey', 'Immunity', 'Breakfast'];

function BlogsPage() {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return blogPosts.filter((post) => {
      const matchesCategory = category === 'All' || post.category === category;
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search) ||
        post.excerpt.toLowerCase().includes(search) ||
        post.tag.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [searchText, category]);

  return (
    <div className="blogs-page">
      <Header />

      <section className="blogs-hero">
        <div className="blogs-container">
          <div className="blogs-hero-card">
            <span className="blogs-kicker">The Organic Way of Life</span>
            <h1>All Blogs</h1>
            <p>
              Read practical guides on organic food, Indian kitchen wisdom, wellness habits,
              traditional ingredients, and healthy swaps for everyday living.
            </p>
          </div>
        </div>
      </section>

      <section className="blogs-filter-section">
        <div className="blogs-container">
          <div className="blogs-filter-card">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <div className="blogs-category-tabs">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? 'active' : ''}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="blogs-list-section">
        <div className="blogs-container">
          {filteredPosts.length === 0 ? (
            <div className="blogs-empty">No blogs found.</div>
          ) : (
            <div className="blogs-grid">
              {filteredPosts.map((post) => (
                <article className="blog-card" key={post.id}>
                  <div className="blog-card-image">
                    <div className="blog-card-image-label">{post.imageText}</div>
                  </div>

                  <div className="blog-card-body">
                    <div className="blog-meta-row">
                      <span>{post.tag}</span>
                      <small>{post.readTime}</small>
                    </div>

                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>

                    <div className="blog-card-bottom">
                      <small>{post.date}</small>
                      <Link to={`/blogs/${post.id}`}>Read more</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="blogs-newsletter-section">
        <div className="blogs-container">
          <div className="blogs-newsletter-card">
            <div>
              <h3>Join the organic food movement</h3>
              <p>Get simple recipes, product knowledge, and special member updates.</p>
            </div>
            <form className="blogs-newsletter-form">
              <input type="email" placeholder="Your email" />
              <button type="button">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default BlogsPage;
