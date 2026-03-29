'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const menuImages = {
  1: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=200&fit=crop',
  2: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&h=200&fit=crop',
  3: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
  4: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
};

const defaultFoodImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop';

export default function RestaurantMenu() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, [id]);

  const fetchMenu = async () => {
    try {
      const res = await api.get(`/restaurants/${id}/menu`);
      setMenu(res.data);
      if (res.data.length > 0) {
        const restRes = await api.get('/restaurants');
        // FIXED: use restRes.data instead of restRes
        const rest = restRes.data.find(r => r.restaurant_id === parseInt(id));
        setRestaurantName(rest?.name || 'Restaurant');
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.item_id === item.item_id);
    if (existing) {
      setCart(cart.map(i => 
        i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`Added ${item.name} to cart`);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.item_id !== itemId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(i => 
        i.item_id === itemId ? { ...i, quantity: newQuantity } : i
      ));
    }
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error('Please login to place order');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const orderItems = cart.map(({ item_id, quantity }) => ({ itemId: item_id, quantity }));
    const token = localStorage.getItem('token');

    try {
      const res = await api.post(
        '/orders',
        { items: orderItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order placed! Total: $${res.data.total}`);
      setCart([]);
      router.push('/orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed');
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Restaurant Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{restaurantName}</h1>
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span>4.5 (500+ ratings)</span>
            </div>
            <span>•</span>
            <span>Fast Delivery</span>
            <span>•</span>
            <span>Open until 11:00 PM</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu</h2>
            <div className="space-y-4">
              {menu.map((item) => (
                <div key={item.item_id} className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 hover:shadow-md transition">
                  <img
                    src={menuImages[item.item_id] || defaultFoodImage}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">Delicious and freshly prepared</p>
                    <p className="text-orange-600 font-bold mt-2">${item.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm sticky top-24">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Your Cart
                </h2>
              </div>
              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-400">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-2">Add items to get started</p>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.item_id} className="mb-4 pb-4 border-b border-gray-100">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-700">{item.name}</span>
                          <span className="text-orange-600 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                            className="bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-lg transition font-medium"
                          >
                            -
                          </button>
                          <span className="text-gray-700 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                            className="bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-lg transition font-medium"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.item_id)}
                            className="text-red-500 text-sm ml-auto hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-gray-800">$2.99</span>
                      </div>
                      <div className="flex justify-between mb-4 pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-800 text-lg">Total</span>
                        <span className="text-2xl font-bold text-orange-600">${(total + 2.99).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={placeOrder}
                        className="w-full btn-primary text-white py-3 rounded-lg font-semibold transition"
                      >
                        Place Order
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}