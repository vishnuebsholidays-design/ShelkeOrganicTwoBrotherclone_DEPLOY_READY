import './FarmVisitPage.css';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

function FarmVisitPage() {
  const { addToCart } = useCart();
  const [variant, setVariant] = useState('day');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variants = {
    day: {
      name: 'Farm Visit (Day)',
      price: 1000,
      label: 'FARM VISIT (DAY) - ₹1,000',
    },
    stay: {
      name: 'Farm Stay (Overnight) : 1 Pax',
      price: 5000,
      label: 'FARM STAY (OVERNIGHT) : 1 pax - ₹5,000',
    },
  };

  const selected = variants[variant];

  const handleAddToCart = () => {
    addToCart({
      id: `farm-visit-${variant}`,
      name: selected.name,
      price: selected.price,
      quantity,
      image: '',
      category: 'Farm Visit',
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="farm-visit-page">
      <Header />

      <main>
        <section className="farm-hero">
          <div className="farm-container farm-hero-grid">
            <div className="farm-gallery">
              <div className="farm-main-image">
                <span>Visit Your Farm</span>
                <small>Where all the goodness comes from</small>
              </div>

              <div className="farm-thumbs">
                <div>Cow Shed</div>
                <div>Jaggery Unit</div>
                <div>Organic Farm</div>
                <div>Ghee Unit</div>
              </div>
            </div>

            <div className="farm-product-card">
              <span className="farm-badge">Farm Experience</span>
              <h1>Visit your farm - where all the goodness comes from</h1>
              <p className="farm-price">₹{selected.price.toLocaleString('en-IN')}</p>

              <div className="farm-field">
                <label>Visit Type</label>
                <select value={variant} onChange={(e) => setVariant(e.target.value)}>
                  <option value="day">{variants.day.label}</option>
                  <option value="stay">{variants.stay.label}</option>
                </select>
              </div>

              <div className="farm-note">
                Our representative will reach you via call/email within 24 business hours to align visit timing and confirmation.
              </div>

              <div className="farm-actions">
                <div className="qty-box">
                  <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>−</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((prev) => prev + 1)}>+</button>
                </div>

                <button className="farm-add-btn" type="button" onClick={handleAddToCart}>
                  {added ? 'Added to Cart ✓' : 'Add To Cart'}
                </button>
              </div>

              <a className="farm-location-btn" href="https://maps.google.com" target="_blank" rel="noreferrer">
                Locate Farm
              </a>
            </div>
          </div>
        </section>

        <section className="farm-info-section">
          <div className="farm-container farm-info-grid">
            <div>
              <p className="farm-kicker">Visit Our Farm</p>
              <h2>Spend a day close to nature, food, farming and real organic processes.</h2>
              <p>
                Experience our cow shed, organic dairy operations, jaggery processing, farm walks, soil health practices and traditional food processing methods. This page is designed for customer booking and can be connected to your cart and checkout flow.
              </p>
            </div>

            <div className="farm-highlight-box">
              <strong>Note</strong>
              <span>Farm visit is about 3 hours from Pune. Breakfast and lunch can be included as per your final operating plan.</span>
            </div>
          </div>
        </section>

        <section className="farm-activities-section">
          <div className="farm-container">
            <div className="farm-section-head">
              <p className="farm-kicker">Activities Included</p>
              <h2>What customers will experience</h2>
            </div>

            <div className="activity-grid">
              <ActivityCard title="Cow Shed & Dairy Operations" items={["Cow shed walk-around", "Native cow breed introduction", "Organic cow-based farming", "Rainwater harvesting structures"]} />
              <ActivityCard title="Jaggery Processing Unit" items={["Jaggery manufacturing flow", "Sugarcane to final product", "Processing hygiene guidelines", "Quality standards"]} />
              <ActivityCard title="Organic Farm Walk" items={["Fruit forest walk", "Intercropping concept", "Soil and irrigation management", "Biodiversity session"]} />
              <ActivityCard title="Ghee & Processing Unit" items={["Bilona ghee method", "Product gallery visit", "Packaging process", "Farm-to-customer story"]} />
            </div>
          </div>
        </section>

        <section className="farm-faq-section">
          <div className="farm-container">
            <div className="farm-section-head">
              <p className="farm-kicker">FAQ</p>
              <h2>Frequently Asked Questions</h2>
            </div>

            <div className="faq-list">
              <Faq question="Where is the farm located?" answer="Our farm location and directions will be shared after booking confirmation. You can update exact address later." />
              <Faq question="On which days are farm visits available?" answer="You can keep farm visits available on Saturdays and Sundays, or update this as per your operations." />
              <Faq question="What are the farm visit timings?" answer="Suggested timing is 10:00 AM to 4:00 PM for a day visit." />
              <Faq question="Is parking available?" answer="Yes, you can mention dedicated visitor parking if available at your farm." />
              <Faq question="Is group booking available?" answer="Yes, this can be arranged for schools, corporates, families and groups after direct coordination." />
              <Faq question="Is transport included?" answer="Transport is not included by default. Customers can visit by their own vehicle unless you decide to add pickup service later." />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ActivityCard({ title, items }) {
  return (
    <div className="activity-card">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function Faq({ question, answer }) {
  return (
    <details className="faq-item">
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  );
}

export default FarmVisitPage;
