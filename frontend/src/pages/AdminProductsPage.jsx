import './AdminProductsPage.css';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import API from '../api';

const PRODUCTS_PER_PAGE = 10;

const emptyForm = {
  name: '',
  category: '',
  price: '',
  short_tagline: '',
  variant_info: '',
  badge: '',
  review_count: '',
  rating: '',
  stock_status: 'In',
  image_url: '',
  description: '',
};

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, categoryFilter, stockFilter]);

  const getAdminHeaders = () => {
    const adminKey = localStorage.getItem('adminKey') || '';

    return {
      adminKey,
      'x-admin-key': adminKey,
      Authorization: adminKey,
    };
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/products`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Product fetch error:', err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${API}${image}`;
    return `${API}/${image}`;
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
          String(p.id).includes(q) ||
          (p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.badge || '').toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (stockFilter === 'In') {
      list = list.filter((p) => Number(p.stock || 0) > 0);
    }

    if (stockFilter === 'Out') {
      list = list.filter((p) => Number(p.stock || 0) <= 0);
    }

    return list;
  }, [products, searchText, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const jsonPayload = {
        name: form.name,
        category: form.category,
        price: form.price,
        short_tagline: form.short_tagline,
        variant_info: form.variant_info,
        badge: form.badge,
        review_count: form.review_count || 0,
        rating: form.rating || '',
        stock: form.stock_status === 'In' ? 1 : 0,
        image_url: form.image_url,
        image: form.image_url,
        description: form.description,
      };

      if (imageFile) {
        const fd = new FormData();

        Object.keys(jsonPayload).forEach((key) => {
          fd.append(key, jsonPayload[key]);
        });

        fd.append('image', imageFile);

        if (editingId) {
          await axios.put(`${API}/admin/products/${editingId}`, fd, {
            headers: {
              ...getAdminHeaders(),
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          await axios.post(`${API}/admin/products`, fd, {
            headers: {
              ...getAdminHeaders(),
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else if (editingId) {
        await axios.put(`${API}/admin/products/${editingId}`, jsonPayload, {
          headers: {
            ...getAdminHeaders(),
            'Content-Type': 'application/json',
          },
        });
      } else {
        await axios.post(`${API}/admin/products`, jsonPayload, {
          headers: {
            ...getAdminHeaders(),
            'Content-Type': 'application/json',
          },
        });
      }

      alert(editingId ? 'Product updated successfully' : 'Product added successfully');
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Product save error:', err.response?.data || err.message);
      alert(err.response?.data?.error || err.response?.data?.message || 'Product save failed');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setShowForm(true);

    setForm({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      short_tagline: product.short_tagline || product.tagline || '',
      variant_info: product.variant_info || '',
      badge: product.badge || '',
      review_count: product.review_count || '',
      rating: product.rating || '',
      stock_status: Number(product.stock || 0) > 0 ? 'In' : 'Out',
      image_url: product.image || product.image_url || '',
      description: product.description || '',
    });

    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await axios.delete(`${API}/admin/products/${id}`, {
        headers: getAdminHeaders(),
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const totalProducts = products.length;
  const inStock = products.filter((p) => Number(p.stock || 0) > 0).length;
  const outStock = products.filter((p) => Number(p.stock || 0) <= 0).length;

  return (
    <AdminLayout title="Product Management" subtitle="Add, edit, delete and update products.">
      <div className="admin-products-page">
        <div className="product-top-actions">
          <button type="button" className="product-add-new-btn" onClick={openAddForm}>
            + Add New Product
          </button>
        </div>

        <div className="product-stats-grid">
          <div className="product-stat-card"><span>Total Products</span><strong>{totalProducts}</strong></div>
          <div className="product-stat-card"><span>In Stock</span><strong>{inStock}</strong></div>
          <div className="product-stat-card"><span>Out Of Stock</span><strong>{outStock}</strong></div>
        </div>

        {showForm && (
          <form className="product-form-card" onSubmit={handleSubmit}>
            <div className="product-form-title-row">
              <h2>{editingId ? `Update Product #${editingId}` : 'Add New Product'}</h2>
              <button type="button" className="product-cancel-btn" onClick={resetForm}>Close</button>
            </div>

            <div className="product-form-grid">
              <div className="product-field">
                <label>Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="product-field">
                <label>Category *</label>
                <input name="category" value={form.category} onChange={handleChange} required />
              </div>

              <div className="product-field">
                <label>Price *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} required />
              </div>

              <div className="product-field">
                <label>Short Tagline</label>
                <input name="short_tagline" value={form.short_tagline} onChange={handleChange} />
              </div>

              <div className="product-field">
                <label>Variant Info</label>
                <input name="variant_info" value={form.variant_info} onChange={handleChange} />
              </div>

              <div className="product-field">
                <label>Badge</label>
                <input name="badge" value={form.badge} onChange={handleChange} />
              </div>

              <div className="product-field">
                <label>Review Count</label>
                <input name="review_count" type="number" value={form.review_count} onChange={handleChange} />
              </div>

              <div className="product-field">
                <label>Rating</label>
                <input name="rating" value={form.rating} onChange={handleChange} />
              </div>

              <div className="product-field">
                <label>Stock Status</label>
                <select name="stock_status" value={form.stock_status} onChange={handleChange}>
                  <option value="In">In Stock</option>
                  <option value="Out">Out Of Stock</option>
                </select>
              </div>

              <div className="product-field full">
                <label>Upload Product Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              </div>

              <div className="product-field full">
                <label>Image URL / Path</label>
                <input name="image_url" value={form.image_url} onChange={handleChange} />
              </div>

              <div className="product-field full">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
              </div>
            </div>

            <button className="product-save-btn" type="submit">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        )}

        <div className="product-filter-card">
          <input placeholder="Search product..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="All">All Stock</option>
            <option value="In">In Stock</option>
            <option value="Out">Out Stock</option>
          </select>

          <button type="button" onClick={fetchProducts}>Refresh</button>
        </div>

        <div className="product-list-card">
          <div className="product-list-head">
            <h2>All Products</h2>
            <span>
              Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
            </span>
          </div>

          {loading ? <div className="product-empty">Loading products...</div> : null}

          {!loading && paginatedProducts.length === 0 ? (
            <div className="product-empty">No products found.</div>
          ) : null}

          {!loading && paginatedProducts.map((product) => {
            const imageSrc = getImageSrc(product.image || product.image_url);
            const isInStock = Number(product.stock || 0) > 0;

            return (
              <div className="product-row-card" key={product.id}>
                <div className="product-row-id">#{product.id}</div>

                <div className="product-thumb">
                  {imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No Image</span>}
                </div>

                <div className="product-row-info">
                  <strong>{product.name}</strong>
                  <span>{product.short_tagline || product.badge || '-'}</span>
                  <small>{product.category || '-'}</small>
                </div>

                <div className="product-row-price">₹{Number(product.price || 0).toFixed(2)}</div>

                <div className={`stock-pill ${isInStock ? 'in' : 'out'}`}>
                  {isInStock ? 'In Stock' : 'Out'}
                </div>

                <div className="product-row-rating">{product.rating || '-'}</div>

                <div className="product-actions">
                  <button type="button" className="product-edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                  <button type="button" className="product-delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length > PRODUCTS_PER_PAGE && (
            <div className="admin-pagination product-pagination">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProductsPage;
