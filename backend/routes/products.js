const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  }
});

const getImageUrl = (req, uploadedFile, imageInput) => {
  if (uploadedFile) {
    return `${req.protocol}://${req.get('host')}/uploads/${uploadedFile.filename}`;
  }

  return (imageInput || '').trim();
};

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, limit = 20, skip = 0 } = req.query;
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (minPrice) query.price = { ...query.price, $gte: parseInt(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseInt(maxPrice) };
    if (search) {
      // Check if search is an exact product ID match
      const productIdMatch = search.match(/^[A-Za-z0-9-]+$/);
      if (productIdMatch) {
        query.productId = productIdMatch[0].toUpperCase();
      } else {
        query.$text = { $search: search };
      }
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      total,
      hasMore: total > parseInt(skip) + products.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (admin only)
router.post('/', auth, upload.single('imageFile'), [
  body('name').trim().isLength({ min: 1 }),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').isIn(['bangles', 'cosmetics']),
  body('description').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const image = getImageUrl(req, req.file, req.body.image);
    if (!image) {
      return res.status(400).json({ message: 'Image URL or image file is required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Generate product ID
    const categoryPrefix = req.body.category === 'bangles' ? 'BNG' : 'COS';
    const lastProduct = await Product.findOne({ productId: new RegExp(`^${categoryPrefix}`) })
      .sort({ productId: -1 });
    
    let nextNumber = 1;
    if (lastProduct) {
      const lastNumber = parseInt(lastProduct.productId.slice(3));
      nextNumber = lastNumber + 1;
    }
    
    const productId = `${categoryPrefix}${nextNumber.toString().padStart(3, '0')}`;
    
    const product = new Product({
      ...req.body,
      image,
      productId
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', auth, upload.single('imageFile'), async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = getImageUrl(req, req.file, req.body.image) || existingProduct.image;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image },
      { new: true, runValidators: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;