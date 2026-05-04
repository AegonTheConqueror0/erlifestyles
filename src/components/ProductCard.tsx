import { Product } from '../types';
import { ShoppingCart, Heart, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../App';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isFlying, setIsFlying] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // Get starting position
    const rect = e.currentTarget.getBoundingClientRect();
    setClickPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    
    setIsFlying(true);
    addToCart(product);
    
    // Hide flying element after animation
    setTimeout(() => setIsFlying(false), 800);
  };

  return (
    <>
      <AnimatePresence>
        {isFlying && (
          <motion.div
            initial={{ 
              x: clickPos.x - 20, 
              y: clickPos.y - 20,
              scale: 1,
              opacity: 1 
            }}
            animate={{ 
              x: document.getElementById('cart-target')?.getBoundingClientRect().left || window.innerWidth - 50,
              y: document.getElementById('cart-target')?.getBoundingClientRect().top || 20,
              scale: 0.1,
              opacity: 0
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed w-12 h-12 rounded-full bg-accent z-[9999] pointer-events-none flex items-center justify-center shadow-xl border-2 border-white overflow-hidden"
          >
             <img src={product.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="relative">
                <img
                  src={product.imageUrl || `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop`}
                  alt={product.name}
                  className="w-full h-80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-md hover:bg-white"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-primary mb-2">{product.name}</h3>
                    <p className="text-sm uppercase tracking-[0.25em] text-accent font-bold">{product.category || 'Supplement'}</p>
                  </div>
                  <span className="text-xl font-bold text-accent">₱{product.price.toLocaleString()}</span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">{product.description}</p>
                {product.healthBenefits && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Health Benefits</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{product.healthBenefits}</p>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-widest font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-full">Stock: {product.stock}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAdd(e); }}
                    className="px-6 py-3 bg-primary text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onClick={() => setShowModal(true)}
        className="bg-white h-full flex flex-col group relative border border-border rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <img 
            src={product.imageUrl || `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop`} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3">
             <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold text-primary shadow-sm">
                {product.category || 'Supplement'}
             </span>
          </div>
          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors shadow-sm">
             <Heart size={14} />
          </button>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-serif font-bold text-primary mb-1 line-clamp-1">{product.name}</h3>
            <div className="flex items-center justify-between">
               <span className="text-base font-bold text-accent">₱{product.price.toLocaleString()}</span>
               {product.stock < 10 && <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">Low Stock</span>}
            </div>
          </div>
          
          <p className="text-slate-500 text-[11px] leading-relaxed mb-5 line-clamp-2">{product.description}</p>
          
          <div className="mt-auto">
            <button 
              onClick={handleAdd}
              className="w-full bg-primary text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-accent hover:scale-[1.02] shadow-lg shadow-primary/10"
            >
              <span className="text-[10px] uppercase tracking-widest font-bold">Add to Cart</span>
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
