# Sapna Bangles & Cosmetics - WhatsApp Style Shopping App

A modern, production-ready full-stack e-commerce application with WhatsApp-style chat interface for browsing and purchasing bangles and cosmetics.

## 🚀 Features

- **WhatsApp-style Chat Interface**: Interactive chatbot for product discovery
- **Smart Product Filtering**: AI-powered search with keywords like "bangles", "cosmetics", "cheap", "premium"
- **Real-time Cart Management**: Add, remove, update quantities
- **Complete Checkout Flow**: Customer details and order placement
- **Admin Dashboard**: Full management system for products and orders
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional design with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📁 Project Structure

```
sapna-bangles-project/
├── backend/
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── admin.js
│   │   └── chat.js
│   ├── middleware/
│   │   └── auth.js
│   ├── controllers/ (optional)
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatInterface.jsx
    │   │   ├── ProductList.jsx
    │   │   ├── ProductModal.jsx
    │   │   ├── Cart.jsx
    │   │   └── Checkout.jsx
    │   ├── pages/
    │   │   ├── AdminLogin.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── context/
    │   │   ├── CartContext.jsx
    │   │   └── AuthContext.jsx
    │   ├── api/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and setup backend:**
```bash
cd backend
npm install
```

2. **Setup environment variables:**
Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/sapna-bangles
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

3. **Seed the database:**
```bash
node seed.js
node seed.js admin  # Creates admin user
```

4. **Start backend:**
```bash
npm run dev
```

5. **Setup frontend (in new terminal):**
```bash
cd ../frontend
npm install
npm run dev
```

### Access the Application

- **Customer Interface**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login
  - Username: `admin`
  - Password: `admin123`

## 📦 API Endpoints

### Products
- `GET /api/products` - Get all products with filtering
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id` - Update order status (admin)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile

### Chat
- `POST /api/chat` - Chat with bot for product filtering

## 🎨 Chat Commands

The chatbot understands these keywords:
- `bangles` - Show bangles
- `cosmetics` - Show cosmetics
- `cheap` - Price < ₹500
- `premium` - Price > ₹700
- `bridal` - Red bangles for weddings
- `gold` - Gold colored items
- `silver` - Silver colored items

## 🚀 Deployment

### Backend (Render)
1. Create a **Web Service** from your GitHub repo.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT=5000`
   - `WHATSAPP_BROADCAST_NUMBER` (optional)
   - `WHATSAPP_GROUP_INVITE_LINK` (optional)
6. Copy your Render URL, example: `https://your-backend.onrender.com`

### Frontend (Vercel)
1. Import same GitHub repo in Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add env var in Vercel:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
6. Deploy and open your public Vercel URL.

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## 🔧 Development

### Adding New Products
Run the seed script to generate sample products:
```bash
cd backend
node seed.js
```

### Admin Features
- View dashboard with statistics
- Manage products (CRUD operations)
- Manage orders and update status
- View revenue analytics

### Customer Flow
1. Open chat interface
2. Type keywords to find products
3. Add products to cart
4. Proceed to checkout
5. Enter delivery details
6. Place order

## 📱 Mobile Responsiveness

The app is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## 🎨 Design System

- **Primary Color**: WhatsApp Green (#25D366)
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Shadows**: Subtle shadows for depth
- **Animations**: Smooth transitions with Framer Motion

## 🔒 Security

- JWT authentication for admin
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variables for secrets

## 📈 Performance

- Lazy loading of components
- Optimized images
- Efficient database queries
- Caching strategies
- Code splitting with Vite

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@sapnabangles.com or create an issue in the repository.

---

**Made with ❤️ for Sapna Bangles & Cosmetics**