const express = require('express');
const Product = require('../models/Product');
const multer = require('multer');
const {
  appendLead,
  extractPhone,
  extractName,
  getWhatsAppDefaults
} = require('../utils/leadStore');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Chat endpoint for filtering products
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { message } = req.body;
    const userMessage = message ? message.toLowerCase().trim() : '';
    
    let query = { isActive: true };
    let responseMessage = '';
    let showProducts = false;
    
    // Check for custom order
    if (userMessage.includes('custom order request')) {
      responseMessage = 'Thank you for your custom order request! We will review your photo and Instagram link and get back to you soon. 📞';
      if (req.file) {
        responseMessage += ` Photo received: ${req.file.filename}`;
      }
      
      const parsedName = extractName(message || '');
      const parsedPhone = extractPhone(message || '');
      const { whatsappBroadcastNumber, whatsappGroupInviteLink } = getWhatsAppDefaults();

      appendLead({
        source: 'reach-out',
        name: parsedName || 'Custom Inquiry',
        phone: parsedPhone || 'Not provided',
        note: 'Custom order request via chat'
      });

      responseMessage += `\n\n📲 WhatsApp Support: +${whatsappBroadcastNumber}`;
      responseMessage += `\n👥 Join WhatsApp Group: ${whatsappGroupInviteLink}`;
      responseMessage += '\n(Abhi dummy details configured hain, aap baad me update kar sakte ho)';

      return res.json({ message: responseMessage });
    }
    
    // Check for product ID
    const productIdMatch = userMessage.match(/(?:^|\s)(BNG\d{3}|COS\d{3})(?:\s|$)/i);
    if (productIdMatch) {
      const productId = productIdMatch[1].toUpperCase();
      const product = await Product.findOne({ productId, isActive: true });
      if (product) {
        responseMessage = `Found product: ${product.name} - ₹${product.price}`;
        showProducts = true;
        query = { _id: product._id };
      } else {
        responseMessage = `Product ID ${productId} not found. Please check the ID and try again.`;
      }
    }
    
    // Smart filtering logic
    if (userMessage.includes('bangles') || userMessage.includes('bangle')) {
      query.category = 'bangles';
      responseMessage = 'Here are our beautiful bangles collection! 💍';
      showProducts = true;
    } else if (userMessage.includes('cosmetics') || userMessage.includes('cosmetic') || userMessage.includes('makeup')) {
      query.category = 'cosmetics';
      responseMessage = 'Check out our premium cosmetics collection! 💄';
      showProducts = true;
    } else if (userMessage.includes('cheap') || userMessage.includes('budget') || userMessage.includes('affordable')) {
      query.price = { $lt: 500 };
      responseMessage = 'Here are our budget-friendly products! 💰';
      showProducts = true;
    } else if (userMessage.includes('premium') || userMessage.includes('expensive') || userMessage.includes('luxury')) {
      query.price = { $gt: 700 };
      responseMessage = 'Explore our premium collection! 👑';
      showProducts = true;
    } else if (userMessage.includes('bridal') || userMessage.includes('wedding') || userMessage.includes('red')) {
      query.tags = { $in: ['bridal', 'red'] };
      responseMessage = 'Perfect for your special day! 💒';
      showProducts = true;
    } else if (userMessage.includes('gold') || userMessage.includes('golden')) {
      query.tags = { $in: ['gold', 'golden'] };
      responseMessage = 'Shining gold collection! ✨';
      showProducts = true;
    } else if (
      userMessage.includes('kashmiri') ||
      userMessage.includes('marathi') ||
      userMessage.includes('kundan') ||
      userMessage.includes('lac') ||
      userMessage.includes('meenakari') ||
      userMessage.includes('temple') ||
      userMessage.includes('rajasthani') ||
      userMessage.includes('chooda') ||
      userMessage.includes('polki') ||
      userMessage.includes('oxidised')
    ) {
      const varietyKeywords = ['kashmiri', 'marathi', 'kundan', 'lac', 'meenakari', 'temple', 'rajasthani', 'chooda', 'polki', 'oxidised'];
      const matchedVariety = varietyKeywords.find((keyword) => userMessage.includes(keyword));
      query.tags = { $in: matchedVariety ? [matchedVariety] : varietyKeywords };
      responseMessage = 'Great choice! Here are bangles from that variety collection 💫';
      showProducts = true;
    } else if (userMessage.includes('silver') || userMessage.includes('silvery')) {
      query.tags = { $in: ['silver', 'silvery'] };
      responseMessage = 'Elegant silver collection! 🌟';
      showProducts = true;
    } else if (userMessage.includes('all') || userMessage.includes('show') || userMessage.includes('products')) {
      responseMessage = 'Here are all our products! 🛍️';
      showProducts = true;
    } else {
      responseMessage = 'I can help you find bangles, cosmetics, or filter by price! Try "bangles", "cosmetics", "cheap", "premium", or "bridal" 💬';
    }
    
    let products = [];
    if (showProducts) {
      products = await Product.find(query).limit(10);
      if (products.length === 0) {
        responseMessage = 'Sorry, no products found matching your criteria. Try different keywords! 🔍';
      }
    }
    
    res.json({
      message: responseMessage,
      products,
      showProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;