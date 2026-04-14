import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShoppingCart } from 'lucide-react';
import ProductList from './ProductList';
import Cart from './Cart';
import Checkout from './Checkout';
import api from '../api/api';
import { useCart } from '../context/CartContext';

const extractProductIdCandidates = (messageText) => {
  const normalizedMessage = messageText.trim();
  if (!normalizedMessage) return [];

  const tokens = normalizedMessage.match(/[A-Za-z0-9-]+/g) || [];
  const candidateSet = new Set();

  tokens.forEach((token) => {
    const cleanToken = token.toUpperCase();
    // Product IDs typically include digits and are at least 3 chars long
    if (cleanToken.length >= 3 && /\d/.test(cleanToken)) {
      candidateSet.add(cleanToken);
    }
  });

  // Keep request count low, while still handling messages with multiple IDs
  return Array.from(candidateSet).slice(0, 3);
};

const findProductByIdCandidates = async (candidates) => {
  for (const candidate of candidates) {
    try {
      const productResponse = await api.get(`/products?search=${encodeURIComponent(candidate)}`);
      const foundProduct = (productResponse.data.products || []).find(
        (product) => product.productId?.toUpperCase() === candidate
      );

      if (foundProduct) {
        return foundProduct;
      }
    } catch (error) {
      console.error('Error fetching product by ID candidate:', error);
    }
  }

  return null;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [customLink, setCustomLink] = useState('');
  const messagesEndRef = useRef(null);
  const { getTotalItems, addToCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Check for product ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    if (productId) {
      // Automatically search for the product
      setInputMessage(productId);
      handleCategorySelect(productId);
    }
  }, []);

  const sendMessage = async (messageText) => {
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Check for product ID(s) in the message and auto-add exact match
    const productIdCandidates = extractProductIdCandidates(messageText);
    let autoAddProduct = null;

    if (productIdCandidates.length > 0) {
      const foundProduct = await findProductByIdCandidates(productIdCandidates);
      if (foundProduct) {
        autoAddProduct = foundProduct;
        addToCart(foundProduct);
      }
    }

    try {
      const response = await api.post('/chat', { message: messageText });
      
      setTimeout(() => {
        let botMessageText = response.data.message;
        
        // Add confirmation if product was auto-added
        if (autoAddProduct) {
          botMessageText += `\n\n✅ **${autoAddProduct.name}** has been added to your cart! 🛒`;
        }
        
        const botMessage = {
          id: Date.now() + 1,
          text: botMessageText,
          sender: 'bot',
          timestamp: new Date(),
          products: response.data.products || []
        };
        
        setMessages(prev => [...prev, botMessage]);
        setProducts(response.data.products || []);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble right now. Please try again! 😔",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleShowCart = () => {
    setShowCart(true);
    setShowCheckout(false);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setShowCart(false);
  };

  const handleBackToChat = () => {
    setShowCart(false);
    setShowCheckout(false);
  };

  const handleCategorySelect = async (category) => {
    await sendMessage(category);
  };

  const handleCustomOrder = async () => {
    if (!customPhoto && !customLink.trim()) return;

    let message = 'Custom order request: ';
    if (customLink.trim()) {
      message += `Instagram link: ${customLink}`;
    }
    if (customPhoto) {
      message += ' (Photo attached)';
    }

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', message);
      if (customPhoto) {
        formData.append('photo', customPhoto);
      }

      const response = await api.post('/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.message || 'Thank you for your custom order request! We will get back to you soon. 📞',
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble right now. Please try again! 😔",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }

    setCustomPhoto(null);
    setCustomLink('');
    // Clear file input
    document.querySelector('input[type="file"]').value = '';
  };

  if (showCheckout) {
    return <Checkout onBack={handleBackToChat} />;
  }

  if (showCart) {
    return <Cart onBack={handleBackToChat} onCheckout={handleCheckout} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="font-semibold">Sapna Bangles & Cosmetics</h1>
              <p className="text-sm opacity-90">Online</p>
            </div>
          </div>
          <button
            onClick={handleShowCart}
            className="relative p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ShoppingCart size={24} />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'chat-bubble-user'
                  : 'chat-bubble-bot'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Products */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
          >
            <ProductList products={products} />
          </motion.div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="chat-bubble-bot">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface border-t">
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => handleCategorySelect('bangles')}
            className="btn-secondary text-sm px-3 py-1"
          >
            Bangles 💍
          </button>
          <button
            onClick={() => handleCategorySelect('cosmetics')}
            className="btn-secondary text-sm px-3 py-1"
          >
            Cosmetics 💄
          </button>
          <button
            onClick={() => handleCategorySelect('bridal')}
            className="btn-secondary text-sm px-3 py-1"
          >
            Bridal 💒
          </button>
          <button
            onClick={() => handleCategorySelect('all products')}
            className="btn-secondary text-sm px-3 py-1"
          >
            All Products 🛍️
          </button>
        </div>

        {/* Quick Add Examples */}
        <div className="text-xs text-text-secondary mb-3 px-2">
          💡 Try: "I want BNG001" or "Add PRD-2201 to cart" - matching product ID gets added instantly!
        </div>

        {/* Custom Order Section */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Custom Order Request 📸</h3>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => setCustomPhoto(e.target.files[0])}
            />
            <input
              type="text"
              placeholder="Instagram link (optional)"
              className="input-field text-sm"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
            />
            <button
              onClick={handleCustomOrder}
              className="btn-primary text-sm px-3 py-1"
              disabled={!customPhoto && !customLink.trim()}
            >
              Send Custom Request
            </button>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type message or product ID (e.g., BNG001) to add to cart instantly!"
            className="input-field flex-1"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;