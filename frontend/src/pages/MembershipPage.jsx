import './MembershipPage.css';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API from '../api';


const fallbackPlans = [
  {
    id: 1,
    plan_key: 'silver',
    name: 'Silver',
    price: 499,
    old_price: 699,
    duration_months: 12,
    badge: 'Starter',
    discount_percent: 5,
    description: 'For first-time members who want simple savings on regular orders.',
    benefits: ['5% member discount', 'Early festive offers', 'Selected deal access', '1 year validity'],
  },
  {
    id: 2,
    plan_key: 'gold',
    name: 'Gold',
    price: 999,
    old_price: 1299,
    duration_months: 12,
    badge: 'Most Popular',
    discount_percent: 10,
    is_featured: true,
    description: 'Perfect for regular buyers who want stronger savings across the year.',
    benefits: ['10% member discount', 'Priority offer access', 'New launch alerts', 'Priority support', '1 year validity'],
  },
  {
    id: 3,
    plan_key: 'platinum',
    name: 'Platinum',
    price: 1499,
    old_price: 1899,
    duration_months: 12,
    badge: 'Premium',
    discount_percent: 12,
    description: 'Best for premium customers who want maximum member benefits.',
    benefits: ['12% member discount', 'Highest priority support', 'Exclusive premium offers', 'Special renewal benefits', '1 year validity'],
  },
];

const perks = [
  { title: 'Everyday Savings', text: 'Member discount applies automatically on eligible orders.' },
  { title: 'Early Access', text: 'Get early access to launches, festive deals and selected offers.' },
  { title: 'Exclusive Offers', text: 'Unlock member-only prices, surprise deals and renewal benefits.' },
];

const steps = [
  { title: 'Choose Your Plan', text: 'Select a plan as per your buying requirement.' },
  { title: 'Complete Razorpay Payment', text: 'Pay securely by UPI, card, netbanking or wallet.' },
  { title: 'Start Saving', text: 'Membership activates automatically after successful payment.' },
];

function MembershipPage() {
  const [plans, setPlans] = useState(fallbackPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${API}/membership-plans`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlans(res.data);
        }
      } catch (err) {
        console.error('Membership plan fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const maxDiscount = useMemo(() => {
    const max = Math.max(...plans.map((p) => Number(p.discount_percent || 0)));
    return Number.isFinite(max) ? max : 0;
  }, [plans]);

  return (
    <div className="membership-page">
      <Header />

      <section className="membership-hero">
        <div className="membership-container membership-hero-grid">
          <div className="membership-hero-content">
            <div className="membership-kicker">Shelke Organic Farms Membership</div>
            <h1>Join The Collective & Start Saving Every Time</h1>
            <p>
              Become a Shelke Organic member and enjoy year-round savings, early access
              to offers, premium support and exclusive member benefits.
            </p>

            <div className="membership-hero-actions">
              <a href="#membership-plans" className="membership-primary-btn">View Plans</a>
              <Link to="/shop" className="membership-outline-btn">Shop Products</Link>
            </div>
          </div>

          <div className="membership-hero-card">
            <span>Maximum Benefit</span>
            <strong>Up to {maxDiscount}% OFF</strong>
            <p>Everyday member savings on eligible orders</p>
          </div>
        </div>
      </section>

      <section className="membership-perks-section">
        <div className="membership-container">
          <div className="membership-section-head">
            <h2>So Many Perks Await</h2>
            <p>Simple benefits designed for regular organic food buyers.</p>
          </div>

          <div className="membership-perks-grid">
            {perks.map((perk) => (
              <div className="membership-perk-card" key={perk.title}>
                <div className="membership-perk-icon">✓</div>
                <h3>{perk.title}</h3>
                <p>{perk.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-plans-section" id="membership-plans">
        <div className="membership-container">
          <div className="membership-section-head">
            <h2>Select & Save</h2>
            <p>{loading ? 'Loading latest plans...' : 'Choose the plan managed by admin.'}</p>
          </div>

          <div className="membership-grid">
            {plans.map((plan) => (
              <div key={plan.plan_key || plan.id} className={`membership-card ${plan.is_featured ? 'featured' : ''}`}>
                <div className="membership-card-badge">{plan.badge || 'Member Plan'}</div>
                <h3>{plan.name}</h3>
                <div className="membership-discount-pill">{Number(plan.discount_percent || 0)}% OFF</div>

                <div className="membership-price-row">
                  <span className="membership-price">₹{Number(plan.price || 0)}</span>
                  {Number(plan.old_price || 0) > 0 ? (
                    <span className="membership-old-price">₹{Number(plan.old_price || 0)}</span>
                  ) : null}
                </div>

                <p className="membership-duration">Every {plan.duration_months || 12} Months</p>
                <p className="membership-plan-text">{plan.description}</p>

                <div className="membership-benefits-list">
                  {(Array.isArray(plan.benefits) ? plan.benefits : []).map((benefit) => (
                    <div className="membership-benefit" key={benefit}>
                      <span>✓</span>
                      <p>{benefit}</p>
                    </div>
                  ))}
                </div>

                <Link to={`/membership/checkout/${plan.plan_key}`} className="membership-buy-btn">
                  Buy Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-compare-section">
        <div className="membership-container">
          <div className="membership-compare-card">
            <div>
              <h2>Non-member Perks</h2>
              <ul>
                <li>Pays normal product price</li>
                <li>Waits for regular sale offers</li>
                <li>Gets standard customer support</li>
              </ul>
            </div>

            <div className="membership-vs">VS</div>

            <div>
              <h2>Member Perks</h2>
              <ul>
                <li>Saves on eligible orders every time</li>
                <li>Gets early offer access</li>
                <li>Unlocks exclusive deals and premium support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="membership-how-section">
        <div className="membership-container">
          <div className="membership-section-head">
            <h2>How To Join?</h2>
            <p>Start your membership in three simple steps.</p>
          </div>

          <div className="membership-steps-grid">
            {steps.map((step, index) => (
              <div className="membership-step-card" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-faq-section">
        <div className="membership-container">
          <div className="membership-faq-card">
            <h2>Got Doubts? FAQs</h2>
            <details open>
              <summary>How is my membership discount applied?</summary>
              <p>After Razorpay payment success, your plan activates automatically and discount is applied at checkout.</p>
            </details>
            <details>
              <summary>Can admin change plans and offers?</summary>
              <p>Yes, admin can create plans, pricing, duration, benefits and discount percentage anytime.</p>
            </details>
            <details>
              <summary>Is membership refundable?</summary>
              <p>Membership fee is generally non-refundable after activation.</p>
            </details>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default MembershipPage;
