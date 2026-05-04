import './WatchShopSection.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API from '../api';

function WatchShopSection() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API}/watch-videos`);
      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Watch videos fetch error:', error);
      setVideos([]);
    }
  };

  if (!videos.length) {
    return null;
  }

  return (
    <section className="watch-shop-section">
      <div className="watch-shop-container">
        <div className="watch-shop-header">
          <h2>It Takes A Village To Make Good Food - Come Take A Peek!</h2>
          <p>Watch product stories, farm videos, demos and shop directly.</p>
        </div>

        <div className="watch-video-row">
          {videos.map((video) => (
            <div className="watch-card" key={video.id}>
              <div className="watch-media">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} />
                ) : (
                  <div className="watch-placeholder">{video.title}</div>
                )}

                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="watch-play"
                >
                  ▶
                </a>
              </div>

              <div className="watch-product-box">
                <div className="watch-product-img">
                  {video.product_image ? (
                    <img src={video.product_image} alt={video.product_name} />
                  ) : (
                    <span>Product</span>
                  )}
                </div>

                <div className="watch-product-info">
                  <h4>{video.product_name || video.title}</h4>
                  <p>₹{Number(video.product_price || 0).toFixed(0)}</p>
                </div>

                <Link
                  to={video.product_link || '/shop'}
                  className="watch-product-link"
                >
                  ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WatchShopSection;