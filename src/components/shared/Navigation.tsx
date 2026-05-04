import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, LogOut, ShoppingCart as CartIcon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../App';

export default function Navigation() {
  const { user, role } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <>
      <nav className="h-16 border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="flex items-center gap-2"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-primary">ER Lifestyles <span className="hidden xs:inline-block text-[10px] uppercase tracking-widest text-accent ml-2 font-sans font-semibold">Wellness & Health</span></span>
          </Link>
          <div className="h-4 w-px bg-border hidden md:block"></div>
          <div className="hidden md:flex gap-8 items-center">
            <button 
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-primary transition-colors"
            >
              Products
            </button>
            <button 
              onClick={() => {
                const testimonialSection = document.getElementById('testimonials');
                if (testimonialSection) {
                  testimonialSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-primary transition-colors"
            >
              Testimonies
            </button>
            {role === 'distributor' && (
              <Link to="/distributor" className="text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-primary transition-colors">Distributor Panel</Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-primary transition-colors">Admin Dashboard</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            id="cart-target"
            onClick={() => setIsCartOpen(true)}
            className="group relative p-2.5 text-slate-400 hover:text-primary transition-all flex items-center justify-center"
          >
            <CartIcon size={22} />
            <AnimatePresence mode="popLayout">
              {totalItems > 0 && (
                <motion.span 
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-transparent transition-transform"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.2 }}
                  >
                    {totalItems}
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] uppercase text-slate-400 tracking-widest leading-none mb-1">Welcome back</p>
                  <p className="text-xs font-medium text-primary">{user.email?.split('@')[0]}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all shadow-md shadow-primary/10">
                Login
              </Link>
            )}
          </div>
          
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-400 hover:text-primary transition-colors p-2">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-border shadow-xl fixed top-16 left-0 right-0 z-40 overflow-y-auto"
          >
            <div className="p-8 space-y-6">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }} 
                className="block text-xs uppercase tracking-widest font-bold text-slate-600 w-full text-left"
              >
                Products
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  const testimonialSection = document.getElementById('testimonials');
                  if (testimonialSection) {
                    testimonialSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }} 
                className="block text-xs uppercase tracking-widest font-bold text-slate-600 w-full text-left"
              >
                Testimonies
              </button>
              {role === 'distributor' && (
                <Link to="/distributor" onClick={() => setIsOpen(false)} className="block text-xs uppercase tracking-widest font-bold text-slate-600">Distributor Panel</Link>
              )}
              {role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-xs uppercase tracking-widest font-bold text-slate-600">Admin Dashboard</Link>
              )}
              <div className="pt-6 border-t border-border">
                {user ? (
                  <button onClick={handleLogout} className="w-full text-left text-xs uppercase tracking-widest font-bold text-primary">Sign Out</button>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-xs uppercase tracking-widest font-bold text-primary">Login</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
