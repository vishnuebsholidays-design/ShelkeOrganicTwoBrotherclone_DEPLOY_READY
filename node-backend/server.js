const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

require('dotenv').config();
const Razorpay = require('razorpay');
//const crypto = require('crypto');

const app = express();

// CORS works for localhost and live frontend URLs.
// Add FRONTEND_URL=https://your-vercel-app.vercel.app in live backend env.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Backend API is running' });
});

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

// -------------------- UPLOADS SETUP --------------------
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    cb(null, `${Date.now()}-${safeName}${ext}`);
  },
});

const upload = multer({ storage });

// -------------------- MYSQL CONNECTION --------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Arvish@1998',
  database: process.env.DB_NAME || 'shelke_store',
  port: Number(process.env.DB_PORT || 3306),
});

db.connect((err) => {
  if (err) {
    console.error('DB Error:', err);
  } else {
    console.log('MySQL Connected');
    ensureMembershipPlansTable();
    ensureOrderPaymentColumns();
  }
});

// ================== RAZORPAY SETUP ==================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// -------------------- ORDER PAYMENT COLUMN SETUP --------------------
function ensureOrderPaymentColumns() {
  const columns = [
    "ALTER TABLE orders ADD COLUMN payment_method VARCHAR(30) DEFAULT 'cod'",
    "ALTER TABLE orders ADD COLUMN payment_status VARCHAR(30) DEFAULT 'Pending'",
    "ALTER TABLE orders ADD COLUMN payment_label VARCHAR(80) DEFAULT 'COD'",
    "ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(120) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(120) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN razorpay_signature VARCHAR(180) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN membership_discount DECIMAL(10,2) DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(80) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN coupon_discount DECIMAL(10,2) DEFAULT 0"
  ];

  columns.forEach((sql) => {
    db.query(sql, (err) => {
      if (err && !String(err.message || '').includes('Duplicate column')) {
        console.log('Order payment column setup skipped:', err.message);
      }
    });
  });
}


// -------------------- MEMBERSHIP PLAN TABLE SETUP --------------------
function normalizePlan(row) {
  let benefits = [];
  try {
    benefits = row.benefits ? JSON.parse(row.benefits) : [];
  } catch {
    benefits = String(row.benefits || '').split('|').filter(Boolean);
  }

  return {
    ...row,
    price: Number(row.price || 0),
    old_price: Number(row.old_price || 0),
    duration_months: Number(row.duration_months || 12),
    discount_percent: Number(row.discount_percent || 0),
    is_featured: Boolean(row.is_featured),
    is_active: Boolean(row.is_active),
    benefits,
  };
}

function ensureMembershipPlansTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS membership_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plan_key VARCHAR(80) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      old_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      duration_months INT NOT NULL DEFAULT 12,
      badge VARCHAR(120) DEFAULT '',
      discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      description TEXT,
      benefits TEXT,
      perks_rules TEXT,
      is_featured TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  db.query(createSql, (err) => {
    if (err) {
      console.error('Membership Plans Table Error:', err);
      return;
    }

    const seedSql = `
      INSERT IGNORE INTO membership_plans
      (plan_key, name, price, old_price, duration_months, badge, discount_percent, description, benefits, perks_rules, is_featured, is_active)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const seedValues = [
      'silver', 'Silver', 499, 699, 12, 'Starter', 5,
      'For first-time members who want simple savings on regular orders.',
      JSON.stringify(['5% member discount', 'Early festive offers', 'Selected deal access', '1 year validity']),
      'Discount applies on eligible products only.', 0, 1,
      'gold', 'Gold', 999, 1299, 12, 'Most Popular', 10,
      'Perfect for regular buyers who want stronger savings across the year.',
      JSON.stringify(['10% member discount', 'Priority offer access', 'New launch alerts', 'Priority support', '1 year validity']),
      'Discount applies on eligible products only. Featured plan.', 1, 1,
      'platinum', 'Platinum', 1499, 1899, 12, 'Premium', 12,
      'Best for premium customers who want maximum member benefits.',
      JSON.stringify(['12% member discount', 'Highest priority support', 'Exclusive premium offers', 'Special renewal benefits', '1 year validity']),
      'Highest member discount applies on eligible products only.', 0, 1,
    ];

    db.query(seedSql, seedValues, (seedErr) => {
      if (seedErr) console.error('Membership Plans Seed Error:', seedErr);
    });
  });
}


// -------------------- ADMIN MIDDLEWARE --------------------
function verifyAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized admin access' });
  }

  next();
}

// -------------------- ADMIN LOGIN --------------------
app.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_KEY) {
    return res.json({ success: true, message: 'Admin login successful' });
  }

  return res.status(401).json({ success: false, error: 'Invalid admin password' });
});

// -------------------- CUSTOMER AUTH --------------------
app.post('/auth/signup', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const checkSql = 'SELECT id FROM users WHERE email = ?';

    db.query(checkSql, [email], async (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Signup Check Error:', checkErr);
        return res.status(500).json({ error: 'Failed to check existing user' });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO users (full_name, email, phone, password)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertSql, [fullName, email, phone || '', hashedPassword], (insertErr, result) => {
        if (insertErr) {
          console.error('Signup Insert Error:', insertErr);
          return res.status(500).json({ error: 'Failed to create account' });
        }

        res.json({
          success: true,
          message: 'Account created successfully',
          user: {
            id: result.insertId,
            full_name: fullName,
            email,
            phone: phone || '',
          },
        });
      });
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Failed to signup' });
  }
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error('Login Error:', err);
      return res.status(500).json({ error: 'Failed to login' });
    }

    if (!result.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result[0];
    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
      },
    });
  });
});

// -------------------- FORGOT / RESET PASSWORD --------------------
app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const getUserSql = 'SELECT id, email FROM users WHERE email = ? LIMIT 1';

  db.query(getUserSql, [email], (err, result) => {
    if (err) {
      console.error('Forgot Password Error:', err);
      return res.status(500).json({ error: 'Failed to process forgot password request' });
    }

    if (!result.length) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date(Date.now() + 1000 * 60 * 30);

    const updateSql = `
      UPDATE users
      SET reset_token = ?, reset_token_expiry = ?
      WHERE email = ?
    `;

    db.query(updateSql, [resetToken, expiryDate, email], (updateErr) => {
      if (updateErr) {
        console.error('Forgot Password Update Error:', updateErr);
        return res.status(500).json({ error: 'Failed to save reset token' });
      }

      res.json({
        success: true,
        message: 'Reset link generated successfully',
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`,
      });
    });
  });
});

app.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const getUserSql = `
      SELECT *
      FROM users
      WHERE reset_token = ?
      LIMIT 1
    `;

    db.query(getUserSql, [token], async (err, result) => {
      if (err) {
        console.error('Reset Password Fetch Error:', err);
        return res.status(500).json({ error: 'Failed to validate reset token' });
      }

      if (!result.length) {
        return res.status(400).json({ error: 'Invalid reset token' });
      }

      const user = result[0];

      if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) {
        return res.status(400).json({ error: 'Reset token expired' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateSql = `
        UPDATE users
        SET password = ?, reset_token = NULL, reset_token_expiry = NULL
        WHERE id = ?
      `;

      db.query(updateSql, [hashedPassword, user.id], (updateErr) => {
        if (updateErr) {
          console.error('Reset Password Update Error:', updateErr);
          return res.status(500).json({ error: 'Failed to reset password' });
        }

        res.json({
          success: true,
          message: 'Password reset successful',
        });
      });
    });
  } catch (error) {
    console.error('Reset Password Catch Error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// -------------------- USERS --------------------
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT id, full_name, email, phone, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('User Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (!result.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
  });
});

app.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, email, phone, currentPassword, newPassword } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const getUserSql = 'SELECT * FROM users WHERE id = ? LIMIT 1';

    db.query(getUserSql, [userId], async (getErr, getResult) => {
      if (getErr) {
        console.error('User Get Error:', getErr);
        return res.status(500).json({ error: 'Failed to load user' });
      }

      if (!getResult.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingUser = getResult[0];

      const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1';

      db.query(checkEmailSql, [email, userId], async (emailErr, emailResult) => {
        if (emailErr) {
          console.error('Email Check Error:', emailErr);
          return res.status(500).json({ error: 'Failed to validate email' });
        }

        if (emailResult.length > 0) {
          return res.status(400).json({ error: 'This email is already used by another account' });
        }

        let finalPassword = existingUser.password;

        if (newPassword && newPassword.trim()) {
          if (!currentPassword || !currentPassword.trim()) {
            return res.status(400).json({ error: 'Current password is required to set a new password' });
          }

          const passwordMatched = await bcrypt.compare(currentPassword, existingUser.password);

          if (!passwordMatched) {
            return res.status(400).json({ error: 'Current password is incorrect' });
          }

          finalPassword = await bcrypt.hash(newPassword, 10);
        }

        const updateSql = `
          UPDATE users
          SET full_name = ?, email = ?, phone = ?, password = ?
          WHERE id = ?
        `;

        db.query(updateSql, [fullName, email, phone || '', finalPassword, userId], (updateErr) => {
          if (updateErr) {
            console.error('User Update Error:', updateErr);
            return res.status(500).json({ error: 'Failed to update profile' });
          }

          const freshUserSql = `
            SELECT id, full_name, email, phone, created_at
            FROM users
            WHERE id = ?
          `;

          db.query(freshUserSql, [userId], (freshErr, freshResult) => {
            if (freshErr) {
              console.error('Fresh User Fetch Error:', freshErr);
              return res.status(500).json({ error: 'Profile updated but failed to fetch latest user' });
            }

            res.json({
              success: true,
              message: 'Profile updated successfully',
              user: freshResult[0],
            });
          });
        });
      });
    });
  } catch (err) {
    console.error('User Update Catch Error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// -------------------- ADDRESS BOOK --------------------
app.get('/users/:id/addresses', (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT *
    FROM user_addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Address Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch addresses' });
    }

    res.json(result);
  });
});

app.get('/users/:id/default-address', (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT *
    FROM user_addresses
    WHERE user_id = ? AND is_default = 1
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Default Address Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch default address' });
    }

    if (!result.length) {
      return res.json(null);
    }

    res.json(result[0]);
  });
});

app.post('/users/:id/addresses', (req, res) => {
  const userId = req.params.id;
  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    landmark,
    addressType,
    isDefault,
  } = req.body;

  if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
    return res.status(400).json({ error: 'Please fill all required address fields' });
  }

  const insertAddress = () => {
    const sql = `
      INSERT INTO user_addresses
      (user_id, full_name, phone, address_line, city, state, pincode, landmark, address_type, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        userId,
        fullName,
        phone,
        addressLine,
        city,
        state,
        pincode,
        landmark || '',
        addressType || 'Home',
        isDefault ? 1 : 0,
      ],
      (err, result) => {
        if (err) {
          console.error('Add Address Error:', err);
          return res.status(500).json({ error: 'Failed to add address' });
        }

        res.json({
          success: true,
          message: 'Address added successfully',
          addressId: result.insertId,
        });
      }
    );
  };

  if (isDefault) {
    const resetSql = `
      UPDATE user_addresses
      SET is_default = 0
      WHERE user_id = ?
    `;

    db.query(resetSql, [userId], (resetErr) => {
      if (resetErr) {
        console.error('Reset Default Address Error:', resetErr);
        return res.status(500).json({ error: 'Failed to reset default address' });
      }

      insertAddress();
    });
  } else {
    insertAddress();
  }
});

app.put('/users/:userId/addresses/:addressId', (req, res) => {
  const { userId, addressId } = req.params;
  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    landmark,
    addressType,
    isDefault,
  } = req.body;

  if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
    return res.status(400).json({ error: 'Please fill all required address fields' });
  }

  const updateAddress = () => {
    const sql = `
      UPDATE user_addresses
      SET
        full_name = ?,
        phone = ?,
        address_line = ?,
        city = ?,
        state = ?,
        pincode = ?,
        landmark = ?,
        address_type = ?,
        is_default = ?
      WHERE id = ? AND user_id = ?
    `;

    db.query(
      sql,
      [
        fullName,
        phone,
        addressLine,
        city,
        state,
        pincode,
        landmark || '',
        addressType || 'Home',
        isDefault ? 1 : 0,
        addressId,
        userId,
      ],
      (err, result) => {
        if (err) {
          console.error('Update Address Error:', err);
          return res.status(500).json({ error: 'Failed to update address' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Address not found' });
        }

        res.json({
          success: true,
          message: 'Address updated successfully',
        });
      }
    );
  };

  if (isDefault) {
    const resetSql = `
      UPDATE user_addresses
      SET is_default = 0
      WHERE user_id = ?
    `;

    db.query(resetSql, [userId], (resetErr) => {
      if (resetErr) {
        console.error('Reset Default Before Update Error:', resetErr);
        return res.status(500).json({ error: 'Failed to reset default address' });
      }

      updateAddress();
    });
  } else {
    updateAddress();
  }
});

app.put('/users/:userId/addresses/:addressId/default', (req, res) => {
  const { userId, addressId } = req.params;

  const resetSql = `
    UPDATE user_addresses
    SET is_default = 0
    WHERE user_id = ?
  `;

  db.query(resetSql, [userId], (resetErr) => {
    if (resetErr) {
      console.error('Set Default Reset Error:', resetErr);
      return res.status(500).json({ error: 'Failed to reset old default address' });
    }

    const setSql = `
      UPDATE user_addresses
      SET is_default = 1
      WHERE id = ? AND user_id = ?
    `;

    db.query(setSql, [addressId, userId], (setErr, result) => {
      if (setErr) {
        console.error('Set Default Address Error:', setErr);
        return res.status(500).json({ error: 'Failed to set default address' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }

      res.json({
        success: true,
        message: 'Default address updated',
      });
    });
  });
});

app.delete('/users/:userId/addresses/:addressId', (req, res) => {
  const { userId, addressId } = req.params;

  const sql = `
    DELETE FROM user_addresses
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [addressId, userId], (err, result) => {
    if (err) {
      console.error('Delete Address Error:', err);
      return res.status(500).json({ error: 'Failed to delete address' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  });
});

// -------------------- CUSTOMER ORDER HISTORY --------------------
app.get('/users/:id/orders', (req, res) => {
  const userId = req.params.id;

  const ordersSql = `
    SELECT *
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
  `;

  db.query(ordersSql, [userId], (ordersErr, ordersResult) => {
    if (ordersErr) {
      console.error('User Orders Fetch Error:', ordersErr);
      return res.status(500).json({ error: 'Failed to fetch user orders' });
    }

    if (!ordersResult.length) {
      return res.json([]);
    }

    const orderIds = ordersResult.map((order) => order.id);

    const itemsSql = `
      SELECT *
      FROM order_items
      WHERE order_id IN (?)
      ORDER BY id ASC
    `;

    db.query(itemsSql, [orderIds], (itemsErr, itemsResult) => {
      if (itemsErr) {
        console.error('User Order Items Fetch Error:', itemsErr);
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }

      const mergedOrders = ordersResult.map((order) => ({
        ...order,
        items: itemsResult.filter((item) => item.order_id === order.id),
      }));

      res.json(mergedOrders);
    });
  });
});

// -------------------- IMAGE UPLOAD --------------------
app.post('/admin/upload-image', verifyAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imagePath,
    });
  } catch (err) {
    console.error('Image Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// -------------------- PRODUCTS --------------------
app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products ORDER BY id ASC';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Product Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    res.json(result);
  });
});

// -------------------- ADMIN PRODUCTS --------------------
app.get('/admin/products', verifyAdmin, (req, res) => {
  const sql = 'SELECT * FROM products ORDER BY id DESC';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Admin Product Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch admin products' });
    }

    res.json(result);
  });
});

app.post('/admin/products', verifyAdmin, (req, res) => {
  const {
    name,
    category,
    short_tagline,
    price,
    variant_info,
    review_count,
    rating,
    badge,
    image,
    description,
    stock,
  } = req.body;

  const sql = `
    INSERT INTO products
    (name, category, short_tagline, price, variant_info, review_count, rating, badge, image, description, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name || '',
    category || '',
    short_tagline || '',
    Number(price) || 0,
    variant_info || '',
    Number(review_count) || 0,
    Number(rating) || 0,
    badge || '',
    image || '',
    description || '',
    Number(stock) || 0,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Admin Product Add Error:', err);
      return res.status(500).json({ error: 'Failed to add product' });
    }

    res.json({
      success: true,
      message: 'Product added successfully',
      productId: result.insertId,
    });
  });
});

app.put('/admin/products/:id', verifyAdmin, (req, res) => {
  const productId = req.params.id;
  const {
    name,
    category,
    short_tagline,
    price,
    variant_info,
    review_count,
    rating,
    badge,
    image,
    description,
    stock,
  } = req.body;

  const sql = `
    UPDATE products
    SET
      name = ?,
      category = ?,
      short_tagline = ?,
      price = ?,
      variant_info = ?,
      review_count = ?,
      rating = ?,
      badge = ?,
      image = ?,
      description = ?,
      stock = ?
    WHERE id = ?
  `;

  const values = [
    name || '',
    category || '',
    short_tagline || '',
    Number(price) || 0,
    variant_info || '',
    Number(review_count) || 0,
    Number(rating) || 0,
    badge || '',
    image || '',
    description || '',
    Number(stock) || 0,
    productId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Admin Product Update Error:', err);
      return res.status(500).json({ error: 'Failed to update product' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
    });
  });
});

app.delete('/admin/products/:id', verifyAdmin, (req, res) => {
  const productId = req.params.id;

  const getImageSql = 'SELECT image FROM products WHERE id = ?';

  db.query(getImageSql, [productId], (findErr, findResult) => {
    if (findErr) {
      console.error('Admin Product Find Error:', findErr);
      return res.status(500).json({ error: 'Failed to find product' });
    }

    if (!findResult.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const imagePath = findResult[0].image;

    const deleteSql = 'DELETE FROM products WHERE id = ?';

    db.query(deleteSql, [productId], (err) => {
      if (err) {
        console.error('Admin Product Delete Error:', err);
        return res.status(500).json({ error: 'Failed to delete product' });
      }

      if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullImagePath = path.join(__dirname, imagePath);

        fs.unlink(fullImagePath, (unlinkErr) => {
          if (unlinkErr) {
            console.log('Image delete skipped:', unlinkErr.message);
          }
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    });
  });
});

// -------------------- SAVE ORDER --------------------
function normalizeOrderPaymentMethod(body = {}) {
  const raw = String(
    body.paymentMethod ||
    body.payment_method ||
    body.paymentType ||
    body.payment_type ||
    ''
  ).toLowerCase().trim();

  const hasRazorpayPayment = Boolean(
    body.razorpayPaymentId ||
    body.razorpay_payment_id ||
    body.razorpayPaymentID ||
    body.razorpay_order_id ||
    body.razorpayOrderId
  );

  if (
    raw === 'online' ||
    raw === 'prepaid' ||
    raw === 'razorpay' ||
    raw === 'paid' ||
    hasRazorpayPayment
  ) {
    return 'online';
  }

  return 'cod';
}

app.post('/orders', (req, res) => {
  const {
    customer,
    items,
    totalItems,
    subtotal,
    shipping,
    grandTotal,
    userId,
    membershipDiscount,
    couponCode,
    couponDiscount,
  } = req.body;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const paymentMethod = normalizeOrderPaymentMethod(req.body);
  const paymentStatus = paymentMethod === 'online' ? 'Paid' : 'Pending';
  const paymentLabel = paymentMethod === 'online' ? 'Prepaid / Razorpay' : 'COD';

  const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id || '';
  const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id || '';
  const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature || '';

  const orderSql = `
    INSERT INTO orders
    (
      user_id, full_name, phone, email, address, city, state, pincode, notes,
      total_items, subtotal, shipping, grand_total, status,
      payment_method, payment_status, payment_label,
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      membership_discount, coupon_code, coupon_discount
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const orderValues = [
    userId || null,
    customer.fullName,
    customer.phone,
    customer.email || '',
    customer.address,
    customer.city,
    customer.state,
    customer.pincode,
    customer.notes || '',
    totalItems,
    subtotal,
    shipping,
    grandTotal,
    'Pending',
    paymentMethod,
    paymentStatus,
    paymentLabel,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    Number(membershipDiscount || 0),
    couponCode || '',
    Number(couponDiscount || 0),
  ];

  db.query(orderSql, orderValues, (err, orderResult) => {
    if (err) {
      console.error('Order Save Error:', err);
      return res.status(500).json({ error: 'Failed to save order' });
    }

    const orderId = orderResult.insertId;

    const itemValues = items.map((item) => [
      orderId,
      item.id,
      item.name,
      item.price,
      item.quantity,
      item.price * item.quantity,
    ]);

    const itemsSql = `
      INSERT INTO order_items
      (order_id, product_id, product_name, price, quantity, line_total)
      VALUES ?
    `;

    db.query(itemsSql, [itemValues], (itemErr) => {
      if (itemErr) {
        console.error('Order Items Save Error:', itemErr);
        return res.status(500).json({ error: 'Failed to save order items' });
      }

      res.json({
        success: true,
        message: paymentMethod === 'online' ? 'Prepaid order placed successfully' : 'COD order placed successfully',
        orderId,
        userId: userId || null,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        payment_label: paymentLabel,
      });
    });
  });
});

// -------------------- ADMIN ORDERS --------------------
app.get('/admin/orders', verifyAdmin, (req, res) => {
  const sql = `
    SELECT *
    FROM orders
    ORDER BY created_at DESC, id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Admin Orders Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    res.json(result);
  });
});

app.get('/admin/orders/:id', verifyAdmin, (req, res) => {
  const orderId = req.params.id;

  const orderSql = `
    SELECT *
    FROM orders
    WHERE id = ?
  `;

  db.query(orderSql, [orderId], (orderErr, orderResult) => {
    if (orderErr) {
      console.error('Admin Single Order Fetch Error:', orderErr);
      return res.status(500).json({ error: 'Failed to fetch order details' });
    }

    if (!orderResult.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsSql = `
      SELECT *
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `;

    db.query(itemsSql, [orderId], (itemsErr, itemsResult) => {
      if (itemsErr) {
        console.error('Admin Order Items Fetch Error:', itemsErr);
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }

      res.json({
        order: orderResult[0],
        items: itemsResult,
      });
    });
  });
});

app.put('/admin/orders/:id/status', verifyAdmin, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const sql = `
    UPDATE orders
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, orderId], (err, result) => {
    if (err) {
      console.error('Order Status Update Error:', err);
      return res.status(500).json({ error: 'Failed to update order status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
    });
  });
});

// -------------------- MEMBERSHIP PLANS --------------------
app.get('/membership-plans', (req, res) => {
  const sql = `
    SELECT *
    FROM membership_plans
    WHERE is_active = 1
    ORDER BY price ASC, id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Public Membership Plans Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch membership plans' });
    }

    res.json(result.map(normalizePlan));
  });
});

app.get('/admin/membership-plans', verifyAdmin, (req, res) => {
  const sql = `
    SELECT *
    FROM membership_plans
    ORDER BY price ASC, id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Admin Membership Plans Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch membership plans' });
    }

    res.json(result.map(normalizePlan));
  });
});

app.post('/admin/membership-plans', verifyAdmin, (req, res) => {
  const {
    plan_key,
    name,
    price,
    old_price,
    duration_months,
    badge,
    discount_percent,
    description,
    benefits,
    perks_rules,
    is_featured,
    is_active,
  } = req.body;

  if (!plan_key || !name || Number(price) <= 0) {
    return res.status(400).json({ error: 'Plan key, name and valid price are required' });
  }

  const sql = `
    INSERT INTO membership_plans
    (plan_key, name, price, old_price, duration_months, badge, discount_percent, description, benefits, perks_rules, is_featured, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    String(plan_key).trim().toLowerCase(),
    name,
    Number(price || 0),
    Number(old_price || 0),
    Number(duration_months || 12),
    badge || '',
    Number(discount_percent || 0),
    description || '',
    JSON.stringify(Array.isArray(benefits) ? benefits : []),
    perks_rules || '',
    is_featured ? 1 : 0,
    is_active ? 1 : 0,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Create Membership Plan Error:', err);
      return res.status(500).json({ error: err.code === 'ER_DUP_ENTRY' ? 'Plan key already exists' : 'Failed to create membership plan' });
    }

    res.json({ success: true, id: result.insertId, message: 'Membership plan created successfully' });
  });
});

app.put('/admin/membership-plans/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const {
    plan_key,
    name,
    price,
    old_price,
    duration_months,
    badge,
    discount_percent,
    description,
    benefits,
    perks_rules,
    is_featured,
    is_active,
  } = req.body;

  if (!plan_key || !name || Number(price) <= 0) {
    return res.status(400).json({ error: 'Plan key, name and valid price are required' });
  }

  const sql = `
    UPDATE membership_plans
    SET plan_key = ?, name = ?, price = ?, old_price = ?, duration_months = ?, badge = ?,
        discount_percent = ?, description = ?, benefits = ?, perks_rules = ?, is_featured = ?, is_active = ?
    WHERE id = ?
  `;

  const values = [
    String(plan_key).trim().toLowerCase(),
    name,
    Number(price || 0),
    Number(old_price || 0),
    Number(duration_months || 12),
    badge || '',
    Number(discount_percent || 0),
    description || '',
    JSON.stringify(Array.isArray(benefits) ? benefits : []),
    perks_rules || '',
    is_featured ? 1 : 0,
    is_active ? 1 : 0,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Update Membership Plan Error:', err);
      return res.status(500).json({ error: err.code === 'ER_DUP_ENTRY' ? 'Plan key already exists' : 'Failed to update membership plan' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    res.json({ success: true, message: 'Membership plan updated successfully' });
  });
});

// -------------------- MEMBERSHIPS --------------------
app.post('/memberships', (req, res) => {
  const {
    customer_id,
    plan_id,
    customer_name,
    customer_email,
    customer_phone,
    city,
    state,
    payment_method,
    payment_status,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    notes,
  } = req.body;

  if (!plan_id || !customer_name || !customer_email || !customer_phone) {
    return res.status(400).json({ error: 'Plan and customer details are required' });
  }

  const planSql = 'SELECT * FROM membership_plans WHERE plan_key = ? AND is_active = 1 LIMIT 1';

  db.query(planSql, [plan_id], (planErr, planResult) => {
    if (planErr) {
      console.error('Membership Plan Lookup Error:', planErr);
      return res.status(500).json({ error: 'Failed to verify membership plan' });
    }

    if (!planResult.length) {
      return res.status(404).json({ error: 'Selected membership plan is not available' });
    }

    const plan = normalizePlan(planResult[0]);
    const isPaidOnline = payment_method === 'online' && payment_status === 'Paid' && razorpay_payment_id;
    const status = isPaidOnline ? 'Active' : 'Pending';
    const startDate = isPaidOnline ? new Date() : null;
    const expiryDate = isPaidOnline ? new Date() : null;

    if (expiryDate) {
      expiryDate.setMonth(expiryDate.getMonth() + Number(plan.duration_months || 12));
    }

    const sql = `
      INSERT INTO memberships
      (
        customer_id,
        plan_id,
        plan_name,
        amount,
        total,
        validity,
        status,
        customer_name,
        customer_email,
        customer_phone,
        city,
        state,
        payment_method,
        notes,
        start_date,
        expiry_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customer_id || null,
      plan.plan_key,
      plan.name,
      Number(plan.price || 0),
      Number(plan.price || 0),
      `${plan.duration_months || 12} Months`,
      status,
      customer_name,
      customer_email,
      customer_phone,
      city || '',
      state || '',
      payment_method || 'online',
      [
        notes || '',
        razorpay_order_id ? `Razorpay Order: ${razorpay_order_id}` : '',
        razorpay_payment_id ? `Razorpay Payment: ${razorpay_payment_id}` : '',
        razorpay_signature ? `Razorpay Signature: ${razorpay_signature}` : '',
      ].filter(Boolean).join('\n'),
      startDate,
      expiryDate,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Create Membership Error:', err);
        return res.status(500).json({
          error: 'Failed to submit membership request',
          details: err.message,
        });
      }

      res.json({
        success: true,
        message: isPaidOnline
          ? 'Membership activated successfully'
          : 'Membership request submitted successfully',
        membershipId: result.insertId,
        status,
        plan,
        start_date: startDate,
        expiry_date: expiryDate,
      });
    });
  });
});

app.get('/memberships/customer/:email', (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT *
    FROM memberships
    WHERE customer_email = ?
    ORDER BY id DESC
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Customer Membership Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch memberships' });
    }

    res.json(result);
  });
});

app.get('/admin/memberships', verifyAdmin, (req, res) => {
  const sql = `
    SELECT *
    FROM memberships
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Admin Membership Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch memberships' });
    }

    res.json(result);
  });
});

app.put('/admin/memberships/:id/status', verifyAdmin, (req, res) => {
  const membershipId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = ['Pending', 'Active', 'Rejected', 'Expired'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid membership status' });
  }

  let startDate = null;
  let expiryDate = null;

  if (status === 'Active') {
    startDate = new Date();

    expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  const sql = `
    UPDATE memberships
    SET status = ?, start_date = ?, expiry_date = ?
    WHERE id = ?
  `;

  db.query(sql, [status, startDate, expiryDate, membershipId], (err, result) => {
    if (err) {
      console.error('Membership Status Update Error:', err);
      return res.status(500).json({ error: 'Failed to update membership status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    res.json({
      success: true,
      message: 'Membership status updated successfully',
    });
  });
});


// -------------------- WATCH & SHOP VIDEOS --------------------
app.get('/watch-videos', (req, res) => {
  const sql = `
    SELECT *
    FROM watch_videos
    WHERE is_active = 1
    ORDER BY sort_order ASC, id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Watch Videos Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch watch videos' });
    }

    res.json(result);
  });
});

app.get('/admin/watch-videos', verifyAdmin, (req, res) => {
  const sql = `
    SELECT *
    FROM watch_videos
    ORDER BY sort_order ASC, id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Admin Watch Videos Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch watch videos' });
    }

    res.json(result);
  });
});

app.post('/admin/watch-videos', verifyAdmin, (req, res) => {
  const {
    title,
    subtitle,
    video_url,
    thumbnail_url,
    product_id,
    product_name,
    product_price,
    product_image,
    product_link,
    sort_order,
    is_active,
  } = req.body;

  if (!title || !video_url) {
    return res.status(400).json({ error: 'Video title and video URL are required' });
  }

  const sql = `
    INSERT INTO watch_videos
    (title, subtitle, video_url, thumbnail_url, product_id, product_name, product_price, product_image, product_link, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title,
    subtitle || '',
    video_url,
    thumbnail_url || '',
    product_id || null,
    product_name || '',
    Number(product_price || 0),
    product_image || '',
    product_link || '',
    Number(sort_order || 0),
    is_active === false || is_active === 0 ? 0 : 1,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Admin Watch Video Add Error:', err);
      return res.status(500).json({ error: 'Failed to add watch video' });
    }

    res.json({
      success: true,
      message: 'Watch video added successfully',
      videoId: result.insertId,
    });
  });
});

app.put('/admin/watch-videos/:id', verifyAdmin, (req, res) => {
  const videoId = req.params.id;
  const {
    title,
    subtitle,
    video_url,
    thumbnail_url,
    product_id,
    product_name,
    product_price,
    product_image,
    product_link,
    sort_order,
    is_active,
  } = req.body;

  if (!title || !video_url) {
    return res.status(400).json({ error: 'Video title and video URL are required' });
  }

  const sql = `
    UPDATE watch_videos
    SET
      title = ?,
      subtitle = ?,
      video_url = ?,
      thumbnail_url = ?,
      product_id = ?,
      product_name = ?,
      product_price = ?,
      product_image = ?,
      product_link = ?,
      sort_order = ?,
      is_active = ?
    WHERE id = ?
  `;

  const values = [
    title,
    subtitle || '',
    video_url,
    thumbnail_url || '',
    product_id || null,
    product_name || '',
    Number(product_price || 0),
    product_image || '',
    product_link || '',
    Number(sort_order || 0),
    is_active === false || is_active === 0 ? 0 : 1,
    videoId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Admin Watch Video Update Error:', err);
      return res.status(500).json({ error: 'Failed to update watch video' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Watch video not found' });
    }

    res.json({
      success: true,
      message: 'Watch video updated successfully',
    });
  });
});

app.delete('/admin/watch-videos/:id', verifyAdmin, (req, res) => {
  const videoId = req.params.id;

  db.query('DELETE FROM watch_videos WHERE id = ?', [videoId], (err, result) => {
    if (err) {
      console.error('Admin Watch Video Delete Error:', err);
      return res.status(500).json({ error: 'Failed to delete watch video' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Watch video not found' });
    }

    res.json({
      success: true,
      message: 'Watch video deleted successfully',
    });
  });
});

// -------------------- REVERSE GEO LOCATION --------------------
app.get('/location/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ShelkeOrganicStore/1.0',
      },
    });

    const data = await response.json();

    if (!data || !data.address) {
      return res.status(404).json({ error: 'Address not found for this location' });
    }

    const address = data.address;

    res.json({
      success: true,
      fullAddress: data.display_name || '',
      addressLine:
        [
          address.road,
          address.suburb,
          address.neighbourhood,
          address.hamlet,
          address.village,
        ]
          .filter(Boolean)
          .join(', ') || '',
      city:
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        '',
      state: address.state || '',
      pincode: address.postcode || '',
      country: address.country || '',
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ error: 'Failed to fetch location address' });
  }
});
// -------------------- MEMBERSHIP DISCOUNT --------------------
app.get('/customer/active-membership/:email', (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT m.*, p.discount_percent, p.duration_months, p.perks_rules, p.benefits
    FROM memberships m
    LEFT JOIN membership_plans p ON p.plan_key = m.plan_id
    WHERE m.customer_email = ?
      AND m.status = 'Active'
      AND (m.expiry_date IS NULL OR m.expiry_date >= CURDATE())
    ORDER BY m.id DESC
    LIMIT 1
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Active membership fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch membership' });
    }

    if (!result.length) {
      return res.json({ hasMembership: false, plan: null, discountPercent: 0 });
    }

    const membership = result[0];
    let discountPercent = Number(membership.discount_percent || 0);

    if (!discountPercent) {
      if (membership.plan_id === 'silver') discountPercent = 5;
      if (membership.plan_id === 'gold') discountPercent = 10;
      if (membership.plan_id === 'platinum') discountPercent = 12;
    }

    res.json({
      hasMembership: true,
      plan: membership,
      discountPercent,
    });
  });
});

// -------------------- RAZORPAY CREATE ORDER --------------------
app.post('/payment/create-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({
      error: 'Failed to create Razorpay order',
      details: error.message,
    });
  }
});

// -------------------- RAZORPAY VERIFY PAYMENT --------------------
app.post('/payment/verify', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: 'Payment verified successfully',
      });
    }

    res.status(400).json({
      success: false,
      error: 'Payment verification failed',
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({
      error: 'Payment verification failed',
    });
  }
});

// -------------------- COUPONS --------------------
app.get('/admin/coupons', verifyAdmin, (req, res) => {
  const sql = 'SELECT * FROM coupons ORDER BY id DESC';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Coupon fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch coupons' });
    }

    res.json(result);
  });
});

app.post('/admin/coupons', verifyAdmin, (req, res) => {
  const {
    code,
    type,
    value,
    min_order,
    max_discount,
    category,
    product_id,
    expiry_date,
  } = req.body;

  if (!code || !type || !value) {
    return res.status(400).json({ message: 'Code, type and value are required' });
  }

  const sql = `
    INSERT INTO coupons
    (code, type, value, min_order, max_discount, category, product_id, expiry_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  db.query(
    sql,
    [
      String(code).trim().toUpperCase(),
      type,
      Number(value || 0),
      Number(min_order || 0),
      Number(max_discount || 0),
      category || null,
      product_id || null,
      expiry_date || null,
    ],
    (err, result) => {
      if (err) {
        console.error('Coupon create error:', err);
        return res.status(500).json({ message: 'Coupon create failed. Code may already exist.' });
      }

      res.json({ success: true, couponId: result.insertId });
    }
  );
});

app.put('/admin/coupons/:id/status', verifyAdmin, (req, res) => {
  const { is_active } = req.body;

  db.query(
    'UPDATE coupons SET is_active = ? WHERE id = ?',
    [is_active ? 1 : 0, req.params.id],
    (err) => {
      if (err) {
        console.error('Coupon status error:', err);
        return res.status(500).json({ message: 'Status update failed' });
      }

      res.json({ success: true });
    }
  );
});

app.delete('/admin/coupons/:id', verifyAdmin, (req, res) => {
  db.query('DELETE FROM coupons WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      console.error('Coupon delete error:', err);
      return res.status(500).json({ message: 'Delete failed' });
    }

    res.json({ success: true });
  });
});

app.post('/apply-coupon', (req, res) => {
  const { code, cartTotal, products = [] } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code required' });
  }

  const normalizeText = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');

  const getProductCategory = (product) =>
    product.category ||
    product.product_category ||
    product.productCategory ||
    product.cat ||
    product.category_name ||
    '';

  const getProductId = (product) =>
    product.id ||
    product.product_id ||
    product.productId ||
    '';

  const sql = `
    SELECT *
    FROM coupons
    WHERE code = ?
      AND is_active = 1
      AND (expiry_date IS NULL OR expiry_date >= CURDATE())
    LIMIT 1
  `;

  db.query(sql, [String(code).trim().toUpperCase()], (err, rows) => {
    if (err) {
      console.error('Apply coupon error:', err);
      return res.status(500).json({ success: false, message: 'Coupon apply failed' });
    }

    if (!rows.length) {
      return res.json({ success: false, message: 'Invalid or expired coupon' });
    }

    const coupon = rows[0];
    const safeProducts = Array.isArray(products) ? products : [];

    if (Number(cartTotal || 0) < Number(coupon.min_order || 0)) {
      return res.json({
        success: false,
        message: `Minimum order ₹${coupon.min_order} required`,
      });
    }

    let eligibleProducts = safeProducts;

    if (coupon.category) {
      const couponCategory = normalizeText(coupon.category);

      eligibleProducts = eligibleProducts.filter((p) => {
        const itemCategory = normalizeText(getProductCategory(p));

        if (!itemCategory) return false;

        return (
          itemCategory === couponCategory ||
          itemCategory.includes(couponCategory) ||
          couponCategory.includes(itemCategory)
        );
      });
    }

    if (coupon.product_id) {
      eligibleProducts = eligibleProducts.filter((p) => {
        const itemId = String(getProductId(p));
        return itemId === String(coupon.product_id);
      });
    }

    let eligibleTotal = eligibleProducts.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 1),
      0
    );

    if (!coupon.category && !coupon.product_id) {
      eligibleTotal = Number(cartTotal || 0);
    }

    if (eligibleTotal <= 0) {
      return res.json({
        success: false,
        message: coupon.category
          ? `Coupon valid only for ${coupon.category} category products`
          : 'Coupon not applicable on selected products',
      });
    }

    let discount = 0;

    if (coupon.type === 'percentage') {
      discount = (eligibleTotal * Number(coupon.value || 0)) / 100;

      if (Number(coupon.max_discount || 0) > 0) {
        discount = Math.min(discount, Number(coupon.max_discount));
      }
    } else {
      discount = Number(coupon.value || 0);
    }

    discount = Math.min(Math.round(discount), eligibleTotal);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      couponCode: coupon.code,
      coupon,
      discount,
      eligibleTotal,
      finalTotal: Math.max(0, Number(cartTotal || 0) - discount),
    });
  });
});
// -------------------- SERVER START --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});