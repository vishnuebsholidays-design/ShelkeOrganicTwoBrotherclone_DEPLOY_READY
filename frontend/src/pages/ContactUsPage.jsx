/**
 * ContactUsPage Component
 *
 * Functionality:
 * - Customer support page inspired by premium organic store contact pages.
 * - Opens from Header > Customers > Contact Us.
 * - Shows phone, WhatsApp, email support, corporate/B2B support and farm visit support.
 * - Includes a clean contact form UI with client-side success message.
 * - Does not disturb existing API/backend flow; form currently stores no backend data.
 */

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ContactUsPage.css';

const SUPPORT_PHONE = '+91 88305 15672';
const SUPPORT_PHONE_LINK = '918830515672';
const SUPPORT_EMAIL = 'info@shelkeorganicfarms.com';
const CUSTOMER_EMAIL = 'support@shelkeorganicfarms.com';
const CORPORATE_EMAIL = 'corporate@shelkeorganicfarms.com';
const FARM_VISIT_EMAIL = 'visit@shelkeorganicfarms.com';

function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      <Header />

      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-container contact-hero-grid">
            <div>
              <p className="contact-kicker">CONTACT US</p>
              <h1>We are here to help you.</h1>
              <p className="contact-hero-text">
                Reach our team for order support, product enquiries, membership assistance,
                gifting, corporate orders and farm visit coordination.
              </p>
            </div>

            <div className="contact-hero-card">
              <span className="contact-card-icon">🌿</span>
              <h2>Pure, Organic & Farmer Sourced</h2>
              <p>Monday to Saturday · 10:00 AM – 6:00 PM</p>
            </div>
          </div>
        </section>

        <section className="contact-content">
          <div className="contact-container contact-layout">
            <div className="contact-info-panel">
              <div className="support-card primary-support-card">
                <div className="support-icon">📞</div>
                <div>
                  <h2>Phone & WhatsApp Support</h2>
                  <a href={`tel:${SUPPORT_PHONE_LINK}`} className="support-main-link">
                    {SUPPORT_PHONE}
                  </a>
                  <p>Monday to Saturday · 10:00 AM – 6:00 PM</p>
                  <div className="support-actions">
                    <a href={`tel:${SUPPORT_PHONE_LINK}`} className="support-btn dark-btn">Call Now</a>
                    <a
                      href={`https://wa.me/${SUPPORT_PHONE_LINK}`}
                      target="_blank"
                      rel="noreferrer"
                      className="support-btn outline-btn"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-email-grid">
                <div className="email-card">
                  <h3>✉️ General Support</h3>
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                </div>

                <div className="email-card">
                  <h3>🛒 Customer Care</h3>
                  <a href={`mailto:${CUSTOMER_EMAIL}`}>{CUSTOMER_EMAIL}</a>
                </div>

                <div className="email-card">
                  <h3>🎁 Gifting / Corporate / B2B</h3>
                  <p>Bulk orders, gifting, weddings and B2B enquiries</p>
                  <a href={`mailto:${CORPORATE_EMAIL}`}>{CORPORATE_EMAIL}</a>
                </div>

                <div className="email-card">
                  <h3>🚜 Farm Visits</h3>
                  <a href={`mailto:${FARM_VISIT_EMAIL}`}>{FARM_VISIT_EMAIL}</a>
                </div>
              </div>

              <div className="address-card">
                <h3>Store / Office Address</h3>
                <p>
                  Shelke Organic Farms, Pune, Maharashtra, India.
                  <br />
                  For exact visit schedule, please contact our support team before visiting.
                </p>
              </div>
            </div>

            <div className="contact-form-card">
              <p className="contact-form-kicker">WRITE TO US</p>
              <h2>Send us a message</h2>
              <p className="form-note">
                Fill the form below and our team will connect with you shortly.
              </p>

              {submitted && (
                <div className="contact-success-msg">
                  Thank you! Your enquiry has been captured. Our team will contact you soon.
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </label>

                <label>
                  E-mail
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    required
                  />
                </label>

                <label>
                  Message
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows="6"
                    required
                  />
                </label>

                <button type="submit" className="contact-submit-btn">Submit</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ContactUsPage;
