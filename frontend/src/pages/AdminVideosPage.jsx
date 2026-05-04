import './AdminVideosPage.css';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import API from '../api';

const emptyForm = {
  title: '',
  subtitle: '',
  video_url: '',
  thumbnail_url: '',
  product_id: '',
  product_name: '',
  product_price: '',
  product_image: '',
  product_link: '',
  sort_order: 0,
  is_active: true,
};

const PAGE_SIZE = 5;

function AdminVideosPage() {
  const [videos, setVideos] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const adminKey = localStorage.getItem('adminKey');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/watch-videos`, {
        headers: { 'x-admin-key': adminKey },
      });
      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Fetch videos error:', error);
      alert('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return videos.filter((video) => {
      const isActive = Number(video.is_active) === 1;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && isActive) ||
        (statusFilter === 'Hidden' && !isActive);

      const matchesSearch =
        !search ||
        [video.id, video.title, video.subtitle, video.product_name, video.product_price, video.sort_order]
          .some((value) => String(value || '').toLowerCase().includes(search));

      return matchesSearch && matchesStatus;
    });
  }, [videos, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `${API}/admin/watch-videos/${editingId}`,
          formData,
          { headers: { 'x-admin-key': adminKey } }
        );
      } else {
        await axios.post(`${API}/admin/watch-videos`, formData, {
          headers: { 'x-admin-key': adminKey },
        });
      }

      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Save video error:', error);
      alert(error.response?.data?.error || 'Failed to save video');
    }
  };

  const handleEdit = (video) => {
    setEditingId(video.id);
    setShowForm(true);
    setFormData({
      title: video.title || '',
      subtitle: video.subtitle || '',
      video_url: video.video_url || '',
      thumbnail_url: video.thumbnail_url || '',
      product_id: video.product_id || '',
      product_name: video.product_name || '',
      product_price: video.product_price || '',
      product_image: video.product_image || '',
      product_link: video.product_link || '',
      sort_order: video.sort_order || 0,
      is_active: Number(video.is_active) === 1,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this video?');
    if (!ok) return;

    try {
      await axios.delete(`${API}/admin/watch-videos/${id}`, {
        headers: { 'x-admin-key': adminKey },
      });
      fetchVideos();
    } catch (error) {
      console.error('Delete video error:', error);
      alert('Failed to delete video');
    }
  };

  return (
    <AdminLayout
      title="Watch & Shop Videos"
      subtitle="Add, edit, delete videos and connect products with each video."
    >
      <div className="admin-video-page">
        <div className="admin-video-top-actions">
          <div>
            <h2>Video Management</h2>
            <p>Existing videos are below. Click Add New Video only when you want to create a new one.</p>
          </div>
          <button type="button" onClick={openAddForm} className="video-add-new-btn">
            + Add New Video
          </button>
        </div>

        {showForm && (
          <form className="admin-video-form-card compact-form" onSubmit={handleSubmit}>
            <div className="admin-video-form-head">
              <h2>{editingId ? 'Edit Video' : 'Add New Video'}</h2>
              <button type="button" onClick={resetForm} className="video-cancel-btn">
                Close
              </button>
            </div>

            <div className="admin-video-form-grid">
              <div className="video-field">
                <label>Video Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="video-field">
                <label>Subtitle</label>
                <input name="subtitle" value={formData.subtitle} onChange={handleChange} />
              </div>

              <div className="video-field video-field--full">
                <label>Video URL *</label>
                <input
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="YouTube / Instagram / video link"
                  required
                />
              </div>

              <div className="video-field video-field--full">
                <label>Thumbnail Image URL</label>
                <input
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleChange}
                  placeholder="Image URL"
                />
              </div>

              <div className="video-field">
                <label>Product ID</label>
                <input name="product_id" value={formData.product_id} onChange={handleChange} />
              </div>

              <div className="video-field">
                <label>Product Name</label>
                <input name="product_name" value={formData.product_name} onChange={handleChange} />
              </div>

              <div className="video-field">
                <label>Product Price</label>
                <input
                  name="product_price"
                  type="number"
                  value={formData.product_price}
                  onChange={handleChange}
                />
              </div>

              <div className="video-field">
                <label>Sort Order</label>
                <input
                  name="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={handleChange}
                />
              </div>

              <div className="video-field video-field--full">
                <label>Product Image URL</label>
                <input name="product_image" value={formData.product_image} onChange={handleChange} />
              </div>

              <div className="video-field video-field--full">
                <label>Product Link</label>
                <input
                  name="product_link"
                  value={formData.product_link}
                  onChange={handleChange}
                  placeholder="/product/1 or /shop"
                />
              </div>

              <label className="video-check">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                Active on website
              </label>
            </div>

            <button className="video-save-btn" type="submit">
              {editingId ? 'Update Video' : 'Save Video'}
            </button>
          </form>
        )}

        <div className="admin-video-list-card">
          <div className="admin-video-list-head">
            <div>
              <h2>All Videos</h2>
              <p>{filteredVideos.length} video(s) found</p>
            </div>
            <button onClick={fetchVideos}>Refresh</button>
          </div>

          <div className="admin-video-filters">
            <input
              className="video-search-input"
              placeholder="Search video, product, ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select
              className="video-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          {loading ? (
            <div className="video-message">Loading videos...</div>
          ) : filteredVideos.length === 0 ? (
            <div className="video-message">No videos found.</div>
          ) : (
            <>
              <div className="video-table-scroll">
                <table className="video-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Preview</th>
                      <th>Video</th>
                      <th>Product</th>
                      <th>Sort</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedVideos.map((video) => (
                      <tr key={video.id}>
                        <td className="video-id">#{video.id}</td>

                        <td>
                          <div className="video-preview">
                            {video.thumbnail_url ? (
                              <img src={video.thumbnail_url} alt={video.title} />
                            ) : (
                              <span>No Image</span>
                            )}
                          </div>
                        </td>

                        <td className="video-info-cell">
                          <strong>{video.title}</strong>
                          <span>{video.subtitle || '-'}</span>
                        </td>

                        <td className="video-info-cell">
                          <strong>{video.product_name || '-'}</strong>
                          <span>₹{Number(video.product_price || 0).toFixed(0)}</span>
                        </td>

                        <td className="video-sort-cell">{video.sort_order}</td>

                        <td>
                          <span className={Number(video.is_active) === 1 ? 'video-active' : 'video-inactive'}>
                            {Number(video.is_active) === 1 ? 'Active' : 'Hidden'}
                          </span>
                        </td>

                        <td>
                          <div className="video-actions">
                            <button onClick={() => handleEdit(video)}>Edit</button>
                            <button onClick={() => handleDelete(video.id)} className="delete">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </button>

                <span>Page {currentPage} of {totalPages}</span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminVideosPage;
