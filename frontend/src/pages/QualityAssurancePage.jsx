import './QualityAssurancePage.css';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function QualityAssurancePage() {
  const labChecks = [
    'Raw material inspection before production',
    'Moisture and shelf-life checks for dry products',
    'Adulteration checks for oil, ghee and key ingredients',
    'Batch-wise quality review before packing',
    'Packaging and storage hygiene verification',
    'Lab report and documentation support',
  ];

  const equipment = [
    {
      title: 'Moisture Analyser',
      text: 'Checks moisture level in flour, spices, masalas and dry products to maintain freshness and shelf life.',
    },
    {
      title: 'Hot Air Oven',
      text: 'Used for drying and re-checking product samples during quality testing.',
    },
    {
      title: 'Oil & Fat Testing',
      text: 'Supports basic purity checks for ghee, oils and high-fat food products.',
    },
    {
      title: 'Raw Material Review',
      text: 'Helps verify consistency of incoming ingredients before they enter production.',
    },
  ];

  const process = [
    {
      step: '01',
      title: 'Source Check',
      text: 'We verify vendor/source details and basic quality before accepting raw material.',
    },
    {
      step: '02',
      title: 'Batch Testing',
      text: 'Important products are checked for freshness, moisture and basic quality parameters.',
    },
    {
      step: '03',
      title: 'Packing Control',
      text: 'Products are packed with hygiene, labeling and storage care.',
    },
    {
      step: '04',
      title: 'Final Dispatch Review',
      text: 'Before dispatch, product condition, packaging and order accuracy are verified.',
    },
  ];

  const projects = [
    'Dedicated quality checklist for every product category',
    'Improved lab report visibility for customers',
    'Better cold-chain handling for selected products',
    'More traceability for farm-to-customer journey',
  ];

  return (
    <div className="qa-page">
      <Header />

      <section className="qa-hero">
        <div className="qa-container qa-hero-grid">
          <div>
            <span className="qa-kicker">Quality Assurance</span>
            <h1>Clean food needs careful quality checks.</h1>
            <p>
              At Shelkey Organic Farms, our quality process is built around clean sourcing,
              careful testing, hygienic packing and transparent product handling.
            </p>
            <div className="qa-hero-actions">
              <Link to="/shop" className="qa-btn qa-btn-primary">Shop Products</Link>
              <Link to="/farm/visit" className="qa-btn qa-btn-outline">Visit Farm</Link>
            </div>
          </div>

          <div className="qa-hero-card">
            <div className="qa-hero-image">Quality Lab</div>
          </div>
        </div>
      </section>

      <section className="qa-section">
        <div className="qa-container qa-intro-grid">
          <div className="qa-image-card">Inside Our Lab</div>
          <div>
            <span className="qa-small-title">Inside our quality control process</span>
            <h2>Every product is checked before it reaches your home.</h2>
            <p>
              Quality is not only a final step for us. From raw material selection to dispatch,
              we follow a structured process to keep products safe, fresh and consistent.
            </p>
            <p>
              Our goal is simple: food should feel like home — clean, trusted and made with care.
            </p>
          </div>
        </div>
      </section>

      <section className="qa-section qa-section-soft">
        <div className="qa-container">
          <div className="qa-section-head">
            <span className="qa-small-title">The People</span>
            <h2>Quality team with clear responsibility.</h2>
            <p>
              Our team reviews product quality, packaging condition, storage standards and customer
              feedback so that improvements happen continuously.
            </p>
          </div>

          <div className="qa-check-grid">
            {labChecks.map((item) => (
              <div className="qa-check-card" key={item}>
                <span>✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="qa-section">
        <div className="qa-container">
          <div className="qa-section-head">
            <span className="qa-small-title">The Equipment</span>
            <h2>Testing support for better consistency.</h2>
            <p>
              Inspired by professional food quality practices, we use a category-wise quality
              checklist and testing approach for our product range.
            </p>
          </div>

          <div className="qa-equipment-grid">
            {equipment.map((item) => (
              <div className="qa-equipment-card" key={item.title}>
                <div className="qa-equipment-img">Lab Tool</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="qa-section qa-section-green">
        <div className="qa-container">
          <div className="qa-section-head light">
            <span className="qa-small-title">Our Process</span>
            <h2>Farm to pack quality journey.</h2>
          </div>

          <div className="qa-process-grid">
            {process.map((item) => (
              <div className="qa-process-card" key={item.step}>
                <strong>{item.step}</strong>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="qa-section">
        <div className="qa-container qa-project-grid">
          <div>
            <span className="qa-small-title">The Projects</span>
            <h2>Improving quality systems step by step.</h2>
            <p>
              As we grow, we are also improving testing systems, product documentation,
              traceability and packaging controls for a more professional customer experience.
            </p>
          </div>

          <div className="qa-project-list">
            {projects.map((item) => (
              <div className="qa-project-item" key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="qa-section qa-report-section">
        <div className="qa-container qa-report-card">
          <div>
            <span className="qa-small-title">Transparency</span>
            <h2>Lab reports and traceability</h2>
            <p>
              We are working toward better transparency where product quality, sourcing and
              testing information becomes easier for customers to verify.
            </p>
          </div>
          <Link to="/shop" className="qa-btn qa-btn-primary">Explore Products</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default QualityAssurancePage;
