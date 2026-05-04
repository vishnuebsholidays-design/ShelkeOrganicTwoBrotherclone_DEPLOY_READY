import './ThankYouPage.css';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="thankyou-page">
      <Header />

      <main className="thankyou-main">
        <div className="thankyou-card">
          <div className="thankyou-icon">✓</div>

          <h1>Order Placed Successfully</h1>

          <p>
            Thank you for shopping with Shelke Organic. Your order has been received.
          </p>

          {orderId && (
            <div className="thankyou-order-box">
              Order ID: <strong>#{orderId}</strong>
            </div>
          )}

          <div className="thankyou-actions">
            <Link to="/account/orders">View My Orders</Link>
            <Link to="/shop" className="secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ThankYouPage;