import { Product } from '../types';
import { ShoppingCart, Heart, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../App';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isFlying, setIsFlying] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });

  const handleAdd = (e: React.MouseEvent) => {
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

      <div className="bg-white h-full flex flex-col group relative border border-border rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
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
