import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductModal from './ProductModal';
import { useCart } from '../context/CartContext';

const ProductList = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const { addToCart } = useCart();

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const categoryOptions = ['all', 'bangles', 'cosmetics', 'bridal'].filter((category) => {
    if (category === 'all') return true;
    if (category === 'bridal') {
      return products.some((product) =>
        Array.isArray(product.tags) &&
        product.tags.some((tag) => tag?.toLowerCase() === 'bridal')
      );
    }
    return products.some((product) => product.category === category);
  });

  const getProductBucket = (product) => {
    const isBridal =
      Array.isArray(product.tags) &&
      product.tags.some((tag) => tag?.toLowerCase() === 'bridal');
    if (isBridal) return 'bridal';
    return product.category;
  };

  const availableTypes = Array.from(
    new Set(
      products.flatMap((product) => {
        if (!Array.isArray(product.tags)) return [];
        if (selectedCategory === 'all') return product.tags;
        return getProductBucket(product) === selectedCategory ? product.tags : [];
      })
    )
  )
    .map((tag) => tag?.toLowerCase())
    .filter(Boolean)
    .filter((tag) => !['bangles', 'cosmetics', 'variety'].includes(tag))
    .sort();

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === 'all' || getProductBucket(product) === selectedCategory;
    if (!categoryMatch) return false;

    if (selectedType === 'all') return true;
    return Array.isArray(product.tags) && product.tags.some((tag) => tag?.toLowerCase() === selectedType);
  });

  return (
    <>
      <div className="mb-3 flex flex-col md:flex-row gap-2">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedType('all');
            }}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="all">All Types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewProduct(product)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x128?text=No+Image';
              }}
            />
            <div className="text-center">
              <h3 className="font-medium text-text text-sm mb-1 truncate">{product.name}</h3>
              <p className="text-xs text-text-secondary mb-2 line-clamp-2">{product.description}</p>
              <p className="text-primary font-bold text-sm">₹{product.price}</p>
              <p className="text-xs text-text-secondary mt-1">ID: {product.productId}</p>
            </div>
            <button
              onClick={(e) => handleAddToCart(product, e)}
              className="btn-primary w-full mt-3 text-sm py-2"
            >
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </>
  );
};

export default ProductList;