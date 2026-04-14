import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = ({ onBack, onCheckout }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="bg-primary text-white p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-1 hover:bg-accent rounded-full">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-semibold">Your Cart</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-text mb-2">Your cart is empty</h2>
            <p className="text-text-secondary">Add some products to get started!</p>
            <button onClick={onBack} className="btn-primary mt-4">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-1 hover:bg-accent rounded-full">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-semibold">Your Cart ({getTotalItems()})</h1>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => {
          // Safety check for item.product
          if (!item.product) return null;
          
          return (
            <motion.div
              key={item.product._id || Math.random()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-surface rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={item.product.image || '/placeholder.jpg'}
                  alt={item.product.name || 'Product'}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text truncate">{item.product.name || 'Unknown Product'}</h3>
                  <p className="text-primary font-semibold">₹{item.product.price || 0}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-surface border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-xl font-bold text-primary">₹{getTotalPrice()}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full btn-primary py-3 text-lg font-semibold"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;