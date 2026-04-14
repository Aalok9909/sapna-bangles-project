import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Share2 } from 'lucide-react';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?productId=${product.productId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Product link copied to clipboard! 📋');
    }).catch(() => {
      alert(`Share this link: ${shareUrl}`);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
            }}
          />
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-text mb-2">{product.name}</h2>
          <p className="text-primary font-bold text-lg mb-3">₹{product.price}</p>
          <p className="text-text-secondary mb-4">{product.description}</p>

          <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
            <span>Category: {product.category}</span>
            <span>Stock: {product.stock}</span>
          </div>

          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleShare}
              className="flex-1 btn-secondary py-3 flex items-center justify-center space-x-2"
            >
              <Share2 size={20} />
              <span>Share</span>
            </button>
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductModal;