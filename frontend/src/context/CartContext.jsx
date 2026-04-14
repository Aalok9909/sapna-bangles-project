import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Safety check for payload and product
      if (!action.payload || !action.payload.product || !action.payload.product._id) {
        console.warn('Invalid product data for ADD_TO_CART:', action.payload);
        return state;
      }
      
      const existingItem = state.items.find(item => 
        item.product && item.product._id === action.payload.product._id
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product && item.product._id === action.payload.product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.product && item.product._id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      // Safety check for payload
      if (!action.payload || !action.payload.productId) {
        console.warn('Invalid payload for UPDATE_QUANTITY:', action.payload);
        return state;
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.product && item.product._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sapna-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        // Filter out invalid items and validate structure
        const validItems = cartItems.filter(item => 
          item && 
          item.product && 
          item.product._id && 
          item.product.name && 
          typeof item.quantity === 'number' && 
          item.quantity > 0
        );
        
        validItems.forEach(item => {
          dispatch({ type: 'ADD_TO_CART', payload: item });
        });
        
        // If there were invalid items, update localStorage
        if (validItems.length !== cartItems.length) {
          localStorage.setItem('sapna-cart', JSON.stringify(validItems));
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted cart data
        localStorage.removeItem('sapna-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sapna-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product) => {
    // Validate product object
    if (!product || !product._id) {
      console.warn('Invalid product object passed to addToCart:', product);
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: { product } });
  };

  const removeFromCart = (productId) => {
    if (!productId) {
      console.warn('Invalid productId passed to removeFromCart:', productId);
      return;
    }
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (!productId || quantity < 0) {
      console.warn('Invalid parameters passed to updateQuantity:', { productId, quantity });
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      if (!item.product || !item.product.price) return total;
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};