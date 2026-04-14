const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Generate 60 bangles with variety-focused styles
const generateBangles = () => {
  const bangles = [];
  const colors = ['Red', 'Maroon', 'Gold', 'Silver', 'Rose Gold', 'Green', 'Blue', 'Purple', 'Pink', 'Ivory'];
  const styles = [
    'Kashmiri',
    'Marathi',
    'Kundan',
    'Lac',
    'Meenakari',
    'Temple',
    'Rajasthani',
    'Punjabi Chooda',
    'Mirror Work',
    'Antique Kada',
    'Pearl',
    'Polki',
    'American Diamond',
    'Oxidised',
    'Bridal',
    'Silk Thread'
  ];
  const imagePool = [
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'
  ];
  
  for (let i = 0; i < 60; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const image = imagePool[Math.floor(Math.random() * imagePool.length)];
    const price = Math.floor(Math.random() * 1800) + 350;
    const stock = Math.floor(Math.random() * 26) + 5;
    const productId = `BNG${String(i + 1).padStart(3, '0')}`;
    
    bangles.push({
      productId,
      name: `${color} ${style} Bangles`,
      price,
      category: 'bangles',
      description: `${style} style ${color.toLowerCase()} bangles set, festive and wedding collection for premium ethnic look.`,
      image,
      stock,
      tags: [color.toLowerCase(), style.toLowerCase(), 'bangles', 'variety']
    });
  }
  return bangles;
};

// Cosmetics data
const cosmeticsData = [
  { name: 'Luxury Lipstick Set', price: 799, category: 'cosmetics', description: 'Premium long-lasting lipstick in multiple shades', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', stock: 20, tags: ['lipstick', 'luxury', 'long-lasting'] },
  { name: 'Foundation Cream', price: 599, category: 'cosmetics', description: 'Natural finish foundation for flawless skin', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', stock: 15, tags: ['foundation', 'natural', 'flawless'] },
  { name: 'Eyeshadow Palette', price: 699, category: 'cosmetics', description: 'Professional eyeshadow palette with 12 shades', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', stock: 12, tags: ['eyeshadow', 'palette', 'professional'] },
  { name: 'Mascara Wand', price: 399, category: 'cosmetics', description: 'Volumizing mascara for dramatic lashes', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', stock: 25, tags: ['mascara', 'volumizing', 'lashes'] },
  { name: 'Blush Compact', price: 499, category: 'cosmetics', description: 'Natural rose blush for healthy glow', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', stock: 18, tags: ['blush', 'natural', 'glow'] },
  // Add more cosmetics...
];

// Generate 25 cosmetics
const generateCosmetics = () => {
  const cosmetics = [];
  const products = ['Lipstick', 'Foundation', 'Eyeshadow', 'Mascara', 'Blush', 'Highlighter', 'Bronzer', 'Concealer', 'Primer', 'Setting Powder', 'Eyeliner', 'Brow Pencil', 'Nail Polish', 'Lip Gloss', 'Face Mask'];
  const brands = ['Luxury', 'Premium', 'Natural', 'Professional', 'Organic'];
  
  for (let i = 0; i < 25; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const price = Math.floor(Math.random() * 600) + 300; // 300-899
    const stock = Math.floor(Math.random() * 25) + 5; // 5-30
    const productId = `COS${String(i + 1).padStart(3, '0')}`;
    
    cosmetics.push({
      productId,
      name: `${brand} ${product}`,
      price,
      category: 'cosmetics',
      description: `High-quality ${product.toLowerCase()} for professional makeup looks`,
      image: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center`,
      stock,
      tags: [product.toLowerCase(), brand.toLowerCase(), 'cosmetics']
    });
  }
  return cosmetics;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sapna-bangles');
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Generate and insert products
    const bangles = generateBangles();
    const cosmetics = generateCosmetics();
    const allProducts = [...bangles, ...cosmetics];
    
    await Product.insertMany(allProducts);
    
    console.log(`Seeded ${allProducts.length} products successfully!`);
    console.log(`Bangles: ${bangles.length}, Cosmetics: ${cosmetics.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sapna-bangles');
    
    const Admin = require('./models/Admin');
    
    const adminData = {
      username: 'admin',
      password: 'admin123',
      email: 'admin@sapnabangles.com',
      role: 'superadmin'
    };
    
    const existingAdmin = await Admin.findOne({ username: adminData.username });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }
    
    const admin = new Admin(adminData);
    await admin.save();
    
    console.log('Admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Admin creation failed:', error);
  }
};

// Run seeding
if (process.argv[2] === 'admin') {
  createAdmin();
} else {
  seedDatabase();
}