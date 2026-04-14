import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/api';

const Checkout = ({ onBack }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.address || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const filteredItems = items.filter(item => item.product && item.product._id);
      console.log('Original items:', items);
      console.log('Filtered items:', filteredItems);
      
      if (filteredItems.length === 0) {
        alert('No valid items in cart. Please add items to cart first.');
        setLoading(false);
        return;
      }

      const orderData = {
        customerName: formData.customerName,
        address: formData.address,
        phone: formData.phone,
        items: filteredItems.map(item => ({
          product: item.product._id,
          name: item.product.name || 'Unknown Product',
          price: item.product.price || 0,
          quantity: item.quantity
        })),
        totalPrice: getTotalPrice()
      };

      console.log('Order data:', orderData);

      const response = await api.post('/orders', orderData);
      
      setOrderId(response.data._id);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error('Order error:', error);
      alert(`Failed to place order: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
        alert(`Validation errors: ${error.response.data.errors.map(e => e.msg).join(', ')}`);
      }
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="bg-primary text-white p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-1 hover:bg-accent rounded-full">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-semibold">Order Confirmed</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-surface rounded-lg p-8 shadow-lg max-w-md w-full"
          >
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-2">Order Placed Successfully!</h2>
            <p className="text-text-secondary mb-4">
              Your order has been received and is being processed.
            </p>
            {orderId && (
              <p className="text-sm text-text-secondary">
                Order ID: {orderId}
              </p>
            )}
            <button onClick={onBack} className="btn-primary mt-6">
              Continue Shopping
            </button>
          </motion.div>
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
            <h1 className="font-semibold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Order Summary */}
        <div className="bg-surface rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="font-semibold text-text mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => {
              // Safety check for item.product
              if (!item.product) return null;
              
              return (
                <div key={item.product._id || Math.random()} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.image || '/placeholder.jpg'}
                      alt={item.product.name || 'Product'}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-text">{item.product.name || 'Unknown Product'}</p>
                      <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-primary">₹{(item.product.price || 0) * item.quantity}</p>
                </div>
              );
            })}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="font-semibold text-text">Total:</span>
            <span className="text-xl font-bold text-primary">₹{getTotalPrice()}</span>
          </div>
        </div>

        {/* Customer Details Form */}
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-text mb-4">Delivery Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Delivery Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input-field resize-none"
                rows="3"
                placeholder="Enter your complete delivery address"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold mt-6 disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;