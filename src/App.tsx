import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { AuthState, UserRole, CartItem } from './types';
import Navigation from './components/shared/Navigation';
import LandingPage from './components/LandingPage';
import DistributorPanel from './components/Distributor/DistributorPanel';
import AdminPanel from './components/Admin/AdminPanel';
import Login from './components/Auth/Login';
import Footer from './components/shared/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Plus, Minus, MapPin, CheckCircle2 } from 'lucide-react';
import PurchaseForm from './components/PurchaseForm';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthState>({ user: null, role: 'customer', loading: true });
const CartContext = createContext<CartContextType | null>(null);

export const useAuth = () => useContext(AuthContext);
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, role: 'customer', loading: true });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notification, setNotification] = useState<{ message: string; sub: string } | null>(null);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        imageUrl: product.imageUrl
      }];
    });

    setNotification({ 
      message: 'Added to Cart', 
      sub: `${product.name} is ready for checkout` 
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };
  const clearCart = () => setCart([]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if Admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() || user.email === 'admin@erwellness.com' || user.email === 'edgardo.rojas@hcdc.edu.ph') {
          setAuthState({ user, role: 'admin', loading: false });
          return;
        }

        // Check if Distributor
        const distDoc = await getDoc(doc(db, 'distributors', user.uid));
        if (distDoc.exists() || user.email === 'partner@erwellness.com') {
          setAuthState({ user, role: 'distributor', loading: false });
          return;
        }

        setAuthState({ user, role: 'customer', loading: false });
      } else {
        setAuthState({ user: null, role: 'customer', loading: false });
      }
    });
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AuthContext.Provider value={authState}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen }}>
        {children}
        
        {/* Shopping Cart Drawer */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
              />
              <motion.aside 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[120] shadow-2xl flex flex-col"
              >
                <div className="p-8 border-b border-border flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-primary">Your Cart</h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">{cart.length} Wellness Items</p>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <ShoppingCart size={64} className="mb-4" />
                      <p className="font-serif italic text-lg text-primary">Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-primary leading-tight">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-accent font-bold text-sm mb-3">₱{item.price.toLocaleString()}</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><Minus size={14} /></button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-8 border-t border-border bg-slate-50/50">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                      <span className="text-3xl font-serif font-bold text-primary">₱{total.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-primary text-white py-5 rounded-2xl text-[11px] uppercase tracking-widest font-bold hover:bg-accent transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                    >
                      <MapPin size={16} />
                      <span>Proceed to Checkout</span>
                    </button>
                  </div>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCheckout && (
            <PurchaseForm onClose={() => setShowCheckout(false)} />
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.8 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm"
            >
              <div className="bg-primary text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-lg leading-tight">{notification.message}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold truncate">{notification.sub}</p>
                </div>
                <button onClick={() => setNotification(null)} className="p-2 text-white/40 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: UserRole }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user && requiredRole !== 'customer') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { role, user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'distributor') return <Navigate to="/distributor" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/distributor');

  return (
    <div className="min-h-screen bg-secondary text-slate-900 font-sans">
      {!isDashboard && <Navigation />}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/distributor/*" 
            element={
              <ProtectedRoute requiredRole="distributor">
                <DistributorPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AnimatePresence>
      {!isDashboard && <Footer />}
    </div>
  );
}
